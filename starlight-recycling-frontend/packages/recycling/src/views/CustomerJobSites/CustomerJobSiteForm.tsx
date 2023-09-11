import React, { FC, ReactElement, useCallback, useMemo, useState } from 'react';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import { useTranslation } from '../../i18n';
import SwipeableViews from 'react-swipeable-views';

import JobSiteForm from '../JobSitesView/JobSiteForm/JobSiteForm';
import AddressForm from '../JobSitesView/JobSiteForm/AddressForm';
import { createStyles, makeStyles, Theme, useTheme } from '@material-ui/core/styles';
import TabPanel from '../../components/TabPanel';
import CustomerJobSiteDetails from './CustomerJobSiteDetails';
import { CustomerJobSiteFormValues } from './types';
import { HaulingCustomerJobSite } from '../../graphql/api';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    tabContent: {
      marginTop: theme.spacing(3),
    },
    statusFieldColHeader: {
      width: 100,
    },
  }),
);

export interface CustomerJobSiteFormProps {
  customerJobSite?: CustomerJobSiteFormValues;
  onSubmit: (values: CustomerJobSiteFormValues) => Promise<any>;
  onCancel: () => void;
  customer?: HaulingCustomerJobSite;
  footerActions?: ReactElement;
  cancelText?: string;
  onSubmitted?: (values: CustomerJobSiteFormValues, result?: any) => void;
  hideStatus?: boolean;
}

export const CustomerJobSiteForm: FC<CustomerJobSiteFormProps> = ({
  customerJobSite,
  onSubmit,
  onCancel,
  customer,
  footerActions,
  cancelText,
  onSubmitted,
  hideStatus = false,
}) => {
  const classes = useStyles();
  const [activeTab, setActiveTab] = useState(0);
  const onTabsChange = useCallback((_, tab) => setActiveTab(tab), [setActiveTab]);
  const theme = useTheme();
  const [t] = useTranslation();

  const values = useMemo(() => {
    return {
      ...(customerJobSite || {
        active: true,
        lineAddress1: '',
        lineAddress2: '',
        selectedLocation: null,
        state: '',
        city: '',
        zip: '',
        projectRequired: false,
        PONumberRequired: customer?.poRequired ?? false,
        popupNote: '',
      }),
    };
  }, [customer, customerJobSite]);

  return (
    <JobSiteForm
      create={!customerJobSite}
      jobSite={values}
      onCancel={onCancel}
      onSubmit={onSubmit}
      footerActions={footerActions}
      cancelText={cancelText}
      onSubmitted={onSubmitted}
    >
      <Tabs indicatorColor="primary" value={activeTab} onChange={onTabsChange} aria-label="tabs">
        <Tab label={t('General Information')} />
        <Tab label={t('Customer Job Site Details')} />
      </Tabs>
      <SwipeableViews
        axis={theme.direction === 'rtl' ? 'x-reverse' : 'x'}
        index={activeTab}
        onChangeIndex={setActiveTab}
      >
        <TabPanel value={activeTab} index={0} dir={theme.direction} className={classes.tabContent}>
          <AddressForm readOnly={!!customerJobSite} disabled={!!customerJobSite} />
        </TabPanel>
        <TabPanel value={activeTab} index={1} dir={theme.direction}>
          <CustomerJobSiteDetails poReadonly={!!customer?.poRequired} hideStatus={hideStatus} />
        </TabPanel>
      </SwipeableViews>
    </JobSiteForm>
  );
};

export default CustomerJobSiteForm;
