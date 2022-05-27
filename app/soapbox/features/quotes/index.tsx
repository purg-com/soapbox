import { OrderedSet as ImmutableOrderedSet } from 'immutable';
import { debounce } from 'lodash';
import React from 'react';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';
import { useDispatch } from 'react-redux';
import { useParams } from 'react-router-dom';

import { expandStatusQuotes, fetchStatusQuotes } from 'soapbox/actions/status_quotes';
import StatusList from 'soapbox/components/status_list';
import SubNavigation from 'soapbox/components/sub_navigation';
import { Column } from 'soapbox/components/ui';
import { useAppSelector } from 'soapbox/hooks';

const messages = defineMessages({
  heading: { id: 'column.quotes', defaultMessage: 'Post quotes' },
});

const handleLoadMore = debounce((statusId: string, dispatch: React.Dispatch<any>) =>
  dispatch(expandStatusQuotes(statusId)), 300, { leading: true });

const Quotes: React.FC = () => {
  const dispatch = useDispatch();
  const intl = useIntl();
  const { statusId } = useParams<{ statusId: string }>();

  const statusIds = useAppSelector((state) => state.status_lists.getIn([`quotes:${statusId}`, 'items'], ImmutableOrderedSet()));
  const isLoading = useAppSelector((state) => state.status_lists.getIn([`quotes:${statusId}`, 'isLoading'], true));
  const hasMore = useAppSelector((state) => !!state.status_lists.getIn([`quotes:${statusId}`, 'next']));

  React.useEffect(() => {
    dispatch(fetchStatusQuotes(statusId));
  }, [statusId]);

  const handleRefresh = () => {
    return dispatch(fetchStatusQuotes(statusId));
  };

  const emptyMessage = <FormattedMessage id='empty_column.quotes' defaultMessage='This post has not been quoted yet.' />;

  return (
    <Column transparent>
      <div className='px-4 pt-4 sm:p-0'>
        <SubNavigation message={intl.formatMessage(messages.heading)} />
      </div>
      <StatusList
        statusIds={statusIds}
        scrollKey={`quotes:${statusId}`}
        hasMore={hasMore}
        isLoading={isLoading}
        onLoadMore={() => handleLoadMore(statusId, dispatch)}
        onRefresh={handleRefresh}
        emptyMessage={emptyMessage}
        divideType='space'
      />
    </Column>
  );
};

export default Quotes;