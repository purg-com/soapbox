import React from 'react';
import { FormattedMessage } from 'react-intl';
import { Redirect, useHistory } from 'react-router-dom';

import { useAccountLookup } from 'soapbox/api/hooks';
import { Column, Layout, Tabs } from 'soapbox/components/ui';
import Header from 'soapbox/features/account/components/header';
import LinkFooter from 'soapbox/features/ui/components/link-footer';
import BundleContainer from 'soapbox/features/ui/containers/bundle-container';
import {
  WhoToFollowPanel,
  ProfileInfoPanel,
  ProfileMediaPanel,
  ProfileFieldsPanel,
  SignUpPanel,
  CtaBanner,
  PinnedAccountsPanel,
} from 'soapbox/features/ui/util/async-components';
import { useAppSelector, useFeatures, useSoapboxConfig } from 'soapbox/hooks';
import { getAcct, isLocal } from 'soapbox/utils/accounts';

interface IProfilePage {
  params?: {
    username?: string
  }
  children: React.ReactNode
}

/** Page to display a user's profile. */
const ProfilePage: React.FC<IProfilePage> = ({ params, children }) => {
  const username = params?.username || '';
  const history = useHistory();
  const { account } = useAccountLookup(params?.username);

  const me = useAppSelector(state => state.me);
  const features = useFeatures();
  const { displayFqn } = useSoapboxConfig();

  // Fix case of username
  if (account && account.acct !== username) {
    return <Redirect to={`/@${account.acct}`} />;
  }

  const tabItems = [
    {
      text: <FormattedMessage id='account.posts' defaultMessage='Posts' />,
      to: `/@${username}`,
      name: 'profile',
    },
    {
      text: <FormattedMessage id='account.posts_with_replies' defaultMessage='Posts and replies' />,
      to: `/@${username}/with_replies`,
      name: 'replies',
    },
    {
      text: <FormattedMessage id='account.media' defaultMessage='Media' />,
      to: `/@${username}/media`,
      name: 'media',
    },
  ];

  if (account) {
    const ownAccount = account.id === me;
    if (ownAccount || !account.pleroma.hide_favorites) {
      tabItems.push({
        text: <FormattedMessage id='navigation_bar.favourites' defaultMessage='Likes' />,
        to: `/@${account.acct}/favorites`,
        name: 'likes',
      });
    }
  }

  let activeItem;
  const pathname = history.location.pathname.replace(`@${username}/`, '');
  if (pathname.endsWith('/with_replies')) {
    activeItem = 'replies';
  } else if (pathname.endsWith('/media')) {
    activeItem = 'media';
  } else if (pathname.endsWith('/favorites')) {
    activeItem = 'likes';
  } else {
    activeItem = 'profile';
  }

  const showTabs = !['/following', '/followers', '/pins'].some(path => pathname.endsWith(path));

  return (
    <>
      <Layout.Main>
        <Column size='lg' label={account ? `@${getAcct(account, displayFqn)}` : ''} withHeader={false}>
          <div className='space-y-4'>
            <Header account={account} />

            <BundleContainer fetchComponent={ProfileInfoPanel}>
              {Component => <Component username={username} account={account} />}
            </BundleContainer>

            {account && showTabs && (
              <Tabs key={`profile-tabs-${account.id}`} items={tabItems} activeItem={activeItem} />
            )}

            {children}
          </div>
        </Column>

        {!me && (
          <BundleContainer fetchComponent={CtaBanner}>
            {Component => <Component key='cta-banner' />}
          </BundleContainer>
        )}
      </Layout.Main>

      <Layout.Aside>
        {!me && (
          <BundleContainer fetchComponent={SignUpPanel}>
            {Component => <Component key='sign-up-panel' />}
          </BundleContainer>
        )}
        <BundleContainer fetchComponent={ProfileMediaPanel}>
          {Component => <Component account={account} />}
        </BundleContainer>
        {account?.fields.length && (
          <BundleContainer fetchComponent={ProfileFieldsPanel}>
            {Component => <Component account={account} />}
          </BundleContainer>
        )}
        {(features.accountEndorsements && account && isLocal(account)) ? (
          <BundleContainer fetchComponent={PinnedAccountsPanel}>
            {Component => <Component account={account} limit={5} key='pinned-accounts-panel' />}
          </BundleContainer>
        ) : me && features.suggestions && (
          <BundleContainer fetchComponent={WhoToFollowPanel}>
            {Component => <Component limit={3} key='wtf-panel' />}
          </BundleContainer>
        )}
        <LinkFooter key='link-footer' />
      </Layout.Aside>
    </>
  );
};

export default ProfilePage;
