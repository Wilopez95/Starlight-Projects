import React, { FC } from 'react';
import { makeStyles } from '@material-ui/core/styles';

import { LOCAL_STORAGE_USER_KEY } from '../../constants';
import { LoginView as CommonLoginView } from '@starlightpro/common';
import BackgroundImage from '../../images/login-bg.png';
import CompanyInfo from '../../components/CompanyInfo';
import { DocumentTitleSetter } from '../../components/DocumentTitle';
import { useTranslation } from '../../i18n';

const useStyles = makeStyles((theme) => ({
  logo: {
    maxWidth: 66,
    maxHeight: 66,
    marginRight: theme.spacing(3),
  },
  loginLeftContainer: {
    display: 'none',
    [theme.breakpoints.up('md')]: {
      width: '50%',
      display: 'block',
      backgroundImage: `url('${BackgroundImage}')`,
      backgroundPosition: 'center bottom',
      backgroundSize: 'cover',
    },
    [theme.breakpoints.up('lg')]: {
      width: '61.75%',
    },
  },
}));

const LoginView: FC = () => {
  const classes = useStyles();
  const [t] = useTranslation();

  return (
    <>
      <DocumentTitleSetter title={t('Log In With Starlight SSO')} />
      <CommonLoginView
        localStorageUserKey={LOCAL_STORAGE_USER_KEY}
        layout={{
          classes: {
            leftContainer: classes.loginLeftContainer,
          },
          logo: <CompanyInfo />,
        }}
      />
    </>
  );
};

export default LoginView;
