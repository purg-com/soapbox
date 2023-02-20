import debounce from 'lodash/debounce';
import React from 'react';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';

import { fetchBookmarkedStatuses, expandBookmarkedStatuses } from 'soapbox/actions/bookmarks';
import PullToRefresh from 'soapbox/components/pull-to-refresh';
import StatusList from 'soapbox/components/status-list';
import { Column } from 'soapbox/components/ui';
import { useAppSelector, useAppDispatch } from 'soapbox/hooks';

const messages = defineMessages({
  heading: { id: 'column.bookmarks', defaultMessage: 'Bookmarks' },
});

const handleLoadMore = debounce((dispatch) => {
  dispatch(expandBookmarkedStatuses());
}, 300, { leading: true });

const Bookmarks: React.FC = () => {
  const dispatch = useAppDispatch();
  const intl = useIntl();

  const statusIds = useAppSelector((state) => state.status_lists.get('bookmarks')!.items);
  const isLoading = useAppSelector((state) => state.status_lists.get('bookmarks')!.isLoading);
  const hasMore = useAppSelector((state) => !!state.status_lists.get('bookmarks')!.next);

  React.useEffect(() => {
    dispatch(fetchBookmarkedStatuses());
  }, []);

  const handleRefresh = () => dispatch(fetchBookmarkedStatuses());

  const emptyMessage = <FormattedMessage id='empty_column.bookmarks' defaultMessage="You don't have any bookmarks yet. When you add one, it will show up here." />;

  return (
    <Column label={intl.formatMessage(messages.heading)} transparent>
      <PullToRefresh onRefresh={handleRefresh}>
        <StatusList
          statusIds={statusIds}
          scrollKey='bookmarked_statuses'
          hasMore={hasMore}
          isLoading={typeof isLoading === 'boolean' ? isLoading : true}
          onLoadMore={() => handleLoadMore(dispatch)}
          emptyMessage={emptyMessage}
          divideType='space'
        />
      </PullToRefresh>
    </Column>
  );
};

export default Bookmarks;
