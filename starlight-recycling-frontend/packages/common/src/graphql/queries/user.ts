import { gql, InMemoryCache } from '@apollo/client';
import { LOCAL_STORAGE_USER_KEY } from '../../constants';
import { ResolverMap } from '../types';
import { UserInfoInput, UserInfo } from '../api';
export { default as USER_INFO_TYPE_DEFS } from './user.schema';

export const USER_INFO_QUERY = gql`
  query GetUserInfo {
    userInfo @client {
      id
      expiresAt
      token
      lastName
      firstName
      email
      resource
      permissions
      refreshToken
      refreshExpiresAt
    }
  }
`;

export const GET_ME_STR = `
  query getMe {
    me {
      id
      lastName
      firstName
      email
      resource
      permissions
    }
  }
`;

export const GET_ME = gql`
  query getMe {
    me {
      id
      lastName
      firstName
      email
      resource
      permissions
    }
  }
`;

export const GET_GRANTED_PERMISSIONS = gql`
  query getGrantedPermissions {
    userInfo @client {
      token
      permissions
    }
  }
`;

export const IS_LOGGED_IN_QUERY = gql`
  query IsUserLoggedIn {
    isLoggedIn @client
  }
`;

export const SET_USER_INFO = gql`
  mutation setUserInfo($userInfo: UserInfoInput!) {
    setUserInfo(userInfo: $userInfo) @client
  }
`;

export const LOG_OUT = gql`
  mutation logOut {
    logOut @client
  }
`;

export interface IsLoggedInResponse {
  isLoggedIn: boolean;
}

export type SetTokenResponse = boolean;
export type LogOutResponse = boolean;

export const UserInfoMutations: ResolverMap = {
  setUserInfo(_, args: { userInfo: UserInfoInput }, context) {
    const { userInfo } = args;
    const { cache } = context;
    const userInfoToStore = {
      expiresAt: userInfo.expiresAt,
      token: userInfo.token,
      refreshToken: userInfo.refreshToken,
      refreshExpiresAt: userInfo.refreshExpiresAt,
      lastName: userInfo.lastName,
      firstName: userInfo.firstName,
      email: userInfo.email,
      resource: userInfo.resource,
      permissions: userInfo.permissions,
      id: userInfo.id,
      __typename: 'UserInfo',
    };

    cache.writeQuery({
      query: IS_LOGGED_IN_QUERY,
      data: {
        isLoggedIn: true,
      },
    });

    cache.writeQuery({
      query: USER_INFO_QUERY,
      data: {
        userInfo: userInfoToStore,
      },
    });

    localStorage.setItem(LOCAL_STORAGE_USER_KEY, JSON.stringify(userInfoToStore));

    return true;
  },
  logOut(parent, args, context) {
    const { cache } = context;

    cache.writeQuery({
      query: IS_LOGGED_IN_QUERY,
      data: {
        isLoggedIn: false,
      },
    });

    cache.writeQuery({
      query: USER_INFO_QUERY,
      data: {
        userInfo: null,
      },
    });

    localStorage.removeItem(LOCAL_STORAGE_USER_KEY);
  },
};

export const initCache = (cache: InMemoryCache, userInfo: UserInfo | null) => {
  cache.writeQuery({
    query: IS_LOGGED_IN_QUERY,
    data: {
      isLoggedIn: !!userInfo,
    },
  });
  cache.writeQuery({
    query: USER_INFO_QUERY,
    data: {
      userInfo: !!userInfo ? { ...userInfo, __typename: 'UserInfo' } : null,
    },
  });
};
