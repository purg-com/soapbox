/**
 * OAuth: create and revoke tokens.
 * Tokens can be used by users and apps.
 * https://docs.joinmastodon.org/methods/apps/oauth/
 * @module soapbox/actions/oauth
 * @see module:soapbox/actions/auth
 */

import { baseClient } from '../api';

import type { AppDispatch } from 'soapbox/store';

const OAUTH_TOKEN_CREATE_REQUEST = 'OAUTH_TOKEN_CREATE_REQUEST';
const OAUTH_TOKEN_CREATE_SUCCESS = 'OAUTH_TOKEN_CREATE_SUCCESS';
const OAUTH_TOKEN_CREATE_FAIL    = 'OAUTH_TOKEN_CREATE_FAIL';

const OAUTH_TOKEN_REVOKE_REQUEST = 'OAUTH_TOKEN_REVOKE_REQUEST';
const OAUTH_TOKEN_REVOKE_SUCCESS = 'OAUTH_TOKEN_REVOKE_SUCCESS';
const OAUTH_TOKEN_REVOKE_FAIL    = 'OAUTH_TOKEN_REVOKE_FAIL';

const obtainOAuthToken = (params: Record<string, string | undefined>, baseURL?: string) =>
  (dispatch: AppDispatch) => {
    dispatch({ type: OAUTH_TOKEN_CREATE_REQUEST, params });
    return baseClient(null, baseURL).post('/oauth/token', params).then(({ data: token }) => {
      dispatch({ type: OAUTH_TOKEN_CREATE_SUCCESS, params, token });
      return token;
    }).catch(error => {
      dispatch({ type: OAUTH_TOKEN_CREATE_FAIL, params, error, skipAlert: true });
      throw error;
    });
  };

const revokeOAuthToken = (params: Record<string, string>) =>
  (dispatch: AppDispatch) => {
    dispatch({ type: OAUTH_TOKEN_REVOKE_REQUEST, params });
    return baseClient().post('/oauth/revoke', params).then(({ data }) => {
      dispatch({ type: OAUTH_TOKEN_REVOKE_SUCCESS, params, data });
      return data;
    }).catch(error => {
      dispatch({ type: OAUTH_TOKEN_REVOKE_FAIL, params, error });
      throw error;
    });
  };

export {
  OAUTH_TOKEN_CREATE_REQUEST,
  OAUTH_TOKEN_CREATE_SUCCESS,
  OAUTH_TOKEN_CREATE_FAIL,
  OAUTH_TOKEN_REVOKE_REQUEST,
  OAUTH_TOKEN_REVOKE_SUCCESS,
  OAUTH_TOKEN_REVOKE_FAIL,
  obtainOAuthToken,
  revokeOAuthToken,
};
