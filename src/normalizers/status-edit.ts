/**
 * Status edit normalizer
*/
import * as DOMPurify from 'dompurify';
import escapeTextContentForBrowser from 'escape-html';
import {
  Map as ImmutableMap,
  List as ImmutableList,
  Record as ImmutableRecord,
  fromJS,
} from 'immutable';

import emojify from 'soapbox/features/emoji';
import { normalizeAttachment } from 'soapbox/normalizers/attachment';
import { normalizeEmoji } from 'soapbox/normalizers/emoji';
import { pollSchema } from 'soapbox/schemas';
import { stripCompatibilityFeatures } from 'soapbox/utils/html';
import { makeEmojiMap } from 'soapbox/utils/normalizers';

import type { ReducerAccount } from 'soapbox/reducers/accounts';
import type { Account, Attachment, Emoji, EmbeddedEntity, Poll } from 'soapbox/types/entities';

export const StatusEditRecord = ImmutableRecord({
  account: null as EmbeddedEntity<Account | ReducerAccount>,
  content: '',
  created_at: new Date(),
  emojis: ImmutableList<Emoji>(),
  favourited: false,
  media_attachments: ImmutableList<Attachment>(),
  poll: null as EmbeddedEntity<Poll>,
  sensitive: false,
  spoiler_text: '',

  // Internal fields
  contentHtml: '',
  spoilerHtml: '',
});

const normalizeAttachments = (statusEdit: ImmutableMap<string, any>) => {
  return statusEdit.update('media_attachments', ImmutableList(), attachments => {
    return attachments.map(normalizeAttachment);
  });
};

// Normalize emojis
const normalizeEmojis = (entity: ImmutableMap<string, any>) => {
  return entity.update('emojis', ImmutableList(), emojis => {
    return emojis.map(normalizeEmoji);
  });
};

// Normalize the poll in the status, if applicable
const normalizeStatusPoll = (statusEdit: ImmutableMap<string, any>) => {
  try {
    const poll = pollSchema.parse(statusEdit.get('poll').toJS());
    return statusEdit.set('poll', poll);
  } catch (_e) {
    return statusEdit.set('poll', null);
  }
};

const normalizeContent = (statusEdit: ImmutableMap<string, any>) => {
  const emojiMap   = makeEmojiMap(statusEdit.get('emojis'));
  const contentHtml = DOMPurify.sanitize(stripCompatibilityFeatures(emojify(statusEdit.get('content'), emojiMap)), { ADD_ATTR: ['target'] });
  const spoilerHtml = DOMPurify.sanitize(emojify(escapeTextContentForBrowser(statusEdit.get('spoiler_text')), emojiMap), { ADD_ATTR: ['target'] });

  return statusEdit
    .set('contentHtml', contentHtml)
    .set('spoilerHtml', spoilerHtml);
};

export const normalizeStatusEdit = (statusEdit: Record<string, any>) => {
  return StatusEditRecord(
    ImmutableMap(fromJS(statusEdit)).withMutations(statusEdit => {
      normalizeAttachments(statusEdit);
      normalizeEmojis(statusEdit);
      normalizeStatusPoll(statusEdit);
      normalizeContent(statusEdit);
    }),
  );
};
