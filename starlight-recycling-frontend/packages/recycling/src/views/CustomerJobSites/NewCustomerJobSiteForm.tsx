import React, { FC } from 'react';
import { Trans } from '../../i18n';
import { pick } from 'lodash-es';
import { gql } from '@apollo/client';
import {
  useCreateHaulingJobSiteMutation,
  useCreateHaulingCustomerJobSiteMutation,
  CreateHaulingCustomerJobSiteMutation,
  HaulingCustomerJobSite,
} from '../../graphql/api';
import { CustomerJobSiteForm } from './CustomerJobSiteForm';
import { showError, showSuccess } from '../../components/Toast';

gql`
  mutation CreateHaulingJobSite($data: JobSiteInput!) {
    createHaulingJobSiteOnCore(data: $data) {
      id
    }
  }
`;

gql`
  mutation CreateHaulingCustomerJobSite($data: HaulingCustomerJobSiteInput!) {
    createHaulingCustomerJS(data: $data) {
      id
    }
  }
`;

export interface NewCustomerJobSiteFormProps {
  customerId: number;
  onCancel: () => void;
  onSubmitted?: (id: number) => void | Promise<void>;
  customer?: HaulingCustomerJobSite;
  hideStatus?: boolean;
}

export const NewCustomerJobSiteForm: FC<NewCustomerJobSiteFormProps> = ({
  customerId,
  onSubmitted,
  onCancel,
  customer,
  hideStatus,
}) => {
  const [createHaulingJobSite] = useCreateHaulingJobSiteMutation();
  const [createHaulingCustomerJobSite] = useCreateHaulingCustomerJobSiteMutation();

  return (
    <CustomerJobSiteForm
      hideStatus={hideStatus}
      onCancel={onCancel}
      customer={customer}
      onSubmit={async ({ popupNote, ...values }) => {
        const { data: jobSiteData } = await createHaulingJobSite({
          variables: {
            data: {
              ...pick(values, [
                'lineAddress1',
                'lineAddress2',
                'city',
                'state',
                'zip',
                'geojson',
                'county',
                'active',
              ]),
              customerId,
            },
          },
        });
        const jobSiteId = jobSiteData?.createHaulingJobSiteOnCore?.id;

        if (!jobSiteId) {
          showError(<Trans>Failed to create customer job site</Trans>);

          return;
        }

        try {
          const { data } = await createHaulingCustomerJobSite({
            variables: {
              data: {
                ...pick(values, ['active', 'PONumberRequired']),
                customerId,
                jobSiteId,
                popupNote: popupNote || null,
              },
            },
          });

          showSuccess(<Trans>Job Site created successfully.</Trans>);

          return { ...data, jobSiteId };
        } catch (e) {
          showError(<Trans>Could not create Job Site.</Trans>);
        }
      }}
      onSubmitted={async (
        values,
        result?: CreateHaulingCustomerJobSiteMutation & { jobSiteId: number },
      ) => {
        const id = result?.createHaulingCustomerJS.id;
        const jobSiteId = result?.jobSiteId;

        if (!id || !jobSiteId) {
          showError(<Trans>Failed to create customer job site</Trans>);

          return;
        }

        try {
          if (onSubmitted) {
            await onSubmitted(jobSiteId);
          }
        } catch (e) {
          showError(<Trans>Failed to update tax exemptions</Trans>);
          // eslint-disable-next-line no-console
          console.error(e);
        }
      }}
    />
  );
};

export default NewCustomerJobSiteForm;
