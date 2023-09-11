import React, { FC, ReactElement, useMemo } from 'react';
import * as yup from 'yup';
import { omit } from 'lodash-es';
import { useTranslation } from '../../../i18n';
import { makeStyles, createStyles, Theme } from '@material-ui/core/styles';

import {
  updateSelectedLocationOnChange,
  valuesToSelectedLocation,
} from '../../../components/FinalForm/decorators/updateSelectedLocationOnChange';
import SidebarForm from '../../../components/FinalForm/SidebarForm';
import { HaulingJobSite } from '../../../graphql/api';
import { SidebarFormProps } from '../../../components/FinalForm/SidebarForm/SidebarForm';
import { CloseConfirmationFormTracker } from '@starlightpro/common';
import { useRegion } from '../../../hooks/useRegion';

const JobSiteSchema = yup.object().shape({
  active: yup.bool().required('Required'),
  searchAddress: yup.string(),
  lineAddress1: yup
    .string()
    .max(200, 'Should be less than 200 characters')
    .trim()
    .required('Required'),
  lineAddress2: yup.string().max(200, 'Should be less than 200 characters').trim(),
  state: yup.string().max(100, 'Should be less then 100 characters').trim().required('Required'),
  city: yup.string().max(100, 'Should be less then 100 characters').trim().required('Required'),
  zip: yup.string().max(50, 'Should be less then 50 characters').trim().required('Required'),
  geojson: yup.object().required('Required'),
  description: yup.string().nullable().max(200, 'Should be less than 200 characters'),
});

interface JobSiteFormProps {
  create?: boolean;
  jobSite?: any;
  onCancel: () => void;
  onSubmit: (values?: any) => void;
  onSubmitted?: (values?: any, result?: any) => void;
  footerActions?: ReactElement;
  cancelText?: string;
  mutators?: SidebarFormProps['mutators'];
}

const initialValues = {
  active: true,
  lineAddress1: '',
  lineAddress2: '',
  selectedLocation: null,
  state: '',
  city: '',
  zip: '',
};

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      '& .MuiTextField-root': {
        marginBottom: theme.spacing(2),
      },
    },
    topDivider: {
      margin: theme.spacing(2, 0),
    },
    subtitle: {
      marginBottom: theme.spacing(1),
    },
    mapWrap: {
      flex: 1,
      marginLeft: theme.spacing(3),
      marginBottom: theme.spacing(2),
    },
    map: {
      height: '100%',
    },
    paper: {
      width: 708,
      minHeight: 700,
    },
  }),
);

export const JobSiteForm: FC<JobSiteFormProps> = ({
  create,
  jobSite,
  onCancel,
  onSubmit,
  children,
  footerActions,
  cancelText,
  mutators,
  onSubmitted,
}) => {
  const classes = useStyles();
  const [t] = useTranslation();
  const { name: countryCode } = useRegion();
  const jobSiteValues = useMemo<HaulingJobSite | null>(() => {
    if (!jobSite) {
      return null;
    }

    return {
      ...jobSite,
      selectedLocation: jobSite.id ? valuesToSelectedLocation(jobSite) : null,
    };
  }, [jobSite]);

  const decorator = useMemo(() => updateSelectedLocationOnChange(countryCode), [countryCode]);

  return (
    <SidebarForm
      create={create}
      cancelable={!create}
      onSubmitted={onSubmitted}
      mutators={mutators}
      decorators={[decorator]}
      initialValues={jobSiteValues || initialValues}
      schema={JobSiteSchema}
      title={t('Create New Job Site')}
      classes={{
        paper: classes.paper,
      }}
      onCancel={onCancel}
      onSubmit={async (values) => {
        const jobSiteInput = { ...values };

        return onSubmit(omit(jobSiteInput, ['__typename', 'selectedLocation', 'projects']));
      }}
      footerActions={footerActions}
      cancelText={cancelText}
      isJobSite
    >
      <CloseConfirmationFormTracker />
      {children}
    </SidebarForm>
  );
};

export default JobSiteForm;
