import React, { FC, forwardRef } from 'react';
import MenuItem from '@material-ui/core/MenuItem';

import { PATHNAME_REGEX } from '../../constants/regex';
import { useLogOutMutation, useGetUserInfoQuery } from '../../graphql/api';

interface Props {
  systemLogout?: boolean;
}

const LogoutMenuItem: FC<Props> = forwardRef(({ children, systemLogout = true }, ref) => {
  const { data } = useGetUserInfoQuery();
  const [logout] = useLogOutMutation();
  const userInfo = data?.userInfo;
  const basenameMatch = window.location.pathname.match(PATHNAME_REGEX);

  let basename = '';

  if (basenameMatch) {
    basename = basenameMatch[0];
  }

  return (
    <MenuItem
      innerRef={ref}
      onClick={async () => {
        await logout();

        window.location.href = `/api${basename}/logout?token=${userInfo?.token}&${
          systemLogout ? 'systemLogout=1' : ''
        }`;
      }}
    >
      {children}
    </MenuItem>
  );
});

export default LogoutMenuItem;
