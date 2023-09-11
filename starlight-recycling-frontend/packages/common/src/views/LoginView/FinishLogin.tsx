import { useEffect, useMemo } from 'react';
import { useSetUserInfoMutation, useGetMeQuery, useGetUserInfoQuery } from '../../graphql/api';

export default function FinishLogin() {
  const { data: meData, loading } = useGetMeQuery();
  const { data: userInfo } = useGetUserInfoQuery();
  const [login] = useSetUserInfoMutation({
    onCompleted: () => {
      // do the redircet only after we set user data
      let redirectTo = localStorage.getItem('redirectTo');

      if (redirectTo) {
        localStorage.removeItem('redirectTo');
        localStorage.removeItem('loginUrl');
      } else {
        const hasRecyclingEnding = (url: string) => /(console|grading){1}/.test(url);
        const redirectEnding = redirectTo && hasRecyclingEnding(redirectTo) ? '/' : '/console';
        redirectTo = window.location.pathname.replace('/finish-login', redirectEnding);
      }

      window.location.href = redirectTo;
    },
  });
  const currentToken = userInfo?.userInfo?.token;
  const me = meData?.me;
  const search = window.location.search;

  const params = useMemo(() => {
    return new URLSearchParams(search);
  }, [search]);

  useEffect(() => {
    if (loading || !me) {
      return;
    }

    const token = params.get('token');
    const refreshToken = params.get('refreshToken');
    const expiresIn = parseInt(params.get('expiresIn') || '3600');
    const refreshExpiresIn = parseInt(params.get('refreshExpiresIn') || '3600');

    if (!token || token === currentToken) {
      return;
    }

    login({
      variables: {
        userInfo: {
          id: me.id || '',
          token: token,
          refreshToken: refreshToken || '',
          expiresAt: new Date(Date.now() + (expiresIn || 3600) * 1000).toUTCString(),
          refreshExpiresAt: new Date(Date.now() + (refreshExpiresIn || 3600) * 1000).toUTCString(),
          firstName: me.firstName || '',
          lastName: me.firstName || '',
          permissions: me.permissions || [],
          email: me.email || '',
          resource: me.resource || '',
        },
      },
    });
  }, [loading, login, currentToken, me, params]);

  return null;
}
