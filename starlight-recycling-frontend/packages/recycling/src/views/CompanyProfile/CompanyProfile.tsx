import React, { FC } from 'react';
import { Trans } from '../../i18n';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';

import BrandForm from './BrandForm';
import LogoRequirements from './LogoRequirments';
import CompanyInfoForm from './CompanyInfoForm';
import { GeneralView } from '@starlightpro/common';

const useStyles = makeStyles((theme) => ({
  title: {
    paddingBottom: theme.spacing(3),
  },
}));

const CompanyProfile: FC = () => {
  const classes = useStyles();

  return (
    <GeneralView
      title={
        <Typography variant="h4" className={classes.title}>
          <Trans>Company Profile</Trans>
        </Typography>
      }
    >
      <BrandForm />
      <LogoRequirements />
      <CompanyInfoForm />
    </GeneralView>
  );
};

export default CompanyProfile;
