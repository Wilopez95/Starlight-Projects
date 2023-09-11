import React, { FC, useEffect, useMemo, useState } from 'react';
import { Trans, useTranslation } from '../../../i18n';
import { useField } from 'react-final-form';

import {
  GetHaulingCustomerJobSitesQuery,
  OrderType,
  useGetHaulingCustomerJobSitePairLazyQuery,
  useGetHaulingCustomerJobSiteLazyQuery,
} from '../../../graphql/api';
import { useOpenFormWithCloseConfirmation } from '@starlightpro/common';
import { SearchFieldWithNewEntity } from '../../../components/FinalForm/SearchField';
import NewCustomerJobSiteForm from '../../CustomerJobSites/NewCustomerJobSiteForm';
import { closeModal } from '../../../components/Modals';
import { ReadOnlyOrderFormComponent } from '../types';
import { useDebouncedHaulingCustomerJobSitesRequest } from '../hooks/useDebouncedHaulingCustomerJobSitesRequest';
import { showPopupNote } from '../helpers/popupNote';
import { useCompanySettings } from '../../../hooks/useCompanySettings';
import { gql } from '@apollo/client';
import { isObject } from 'lodash-es';
import { orderStatuses } from '../../OrdersView/constant';

gql`
  query getHaulingCustomerJobSite($filter: HaulingCustomerJobSitePairByIdFilterInput!) {
    haulingCustomerJobSite(filter: $filter) {
      id
      active
      poRequired
      popupNote
      fullAddress
      location
      contactId
      originalId
      address {
        addressLine1
        addressLine2
        city
        state
        zip
      }
    }
  }
`;

interface Props extends ReadOnlyOrderFormComponent {
  onChange?: (id: number) => void;
  allowCreateNew?: boolean;
}

type CustomerJobSiteOptionData = GetHaulingCustomerJobSitesQuery['haulingCustomerJobSites'][number];

export type CustomerJobSiteOption = {
  label: string;
  value: number;
  popupNote?: string;
  jobSite: CustomerJobSiteOptionData;
};

export const JobSiteInput: FC<Props> = ({ onChange, readOnly, allowCreateNew = true }) => {
  const [t] = useTranslation();
  const { input } = useField('customerJobSite', { subscription: { value: true } });
  const {
    input: { value: jobSite, onChange: jobSiteOnChange },
    meta: { initial: initialJobSite },
  } = useField('jobSite', { subscription: { value: true, initial: true } });
  const {
    input: { value: customer },
  } = useField('customer', { subscription: { value: true } });

  const {
    input: { value: customerTruck },
  } = useField('customerTruck', { subscription: { value: true } });
  const {
    input: { value: orderType },
  } = useField('type', { subscription: { value: true } });
  const {
    input: { value: orderStatus },
  } = useField('status', { subscription: { value: true } });
  const customerId = customer?.id;
  const { jobSiteId: companyJobSiteId } = useCompanySettings();
  const [options, setOptions] = useState<CustomerJobSiteOption[]>([]);

  let { jobSiteOptions, setInputDebounced } = useDebouncedHaulingCustomerJobSitesRequest({
    customerId,
  });

  useEffect(() => {
    if (jobSiteOptions) {
      setOptions(jobSiteOptions);
    }
  }, [jobSiteOptions, setOptions]);

  useEffect(() => {
    if (jobSite && jobSiteOptions.every(({ value }) => value !== jobSite.id)) {
      setOptions([
        {
          label: jobSite.fullAddress,
          value: jobSite.id,
          popupNote: jobSite.popupNote,
          jobSite: jobSite,
        } as CustomerJobSiteOption,
        ...jobSiteOptions,
      ]);
    }
  }, [setOptions, jobSiteOptions, jobSite]);

  const [getHaulingCustomerJobSitePair] = useGetHaulingCustomerJobSitePairLazyQuery({
    onCompleted(data) {
      if (!data) {
        return;
      }
      input.onChange({
        target: { name: 'customerJobSite', value: data.haulingCustomerJobSitePair },
      });
    },
    nextFetchPolicy: 'network-only',
    fetchPolicy: 'network-only',
  });

  const [getHaulingJobSite] = useGetHaulingCustomerJobSiteLazyQuery({
    onCompleted(data) {
      if (!data) {
        return;
      }
      const jobSite = data.haulingCustomerJobSite;
      jobSiteOnChange({
        target: { name: 'jobSite', value: jobSite },
      });
    },
    nextFetchPolicy: 'network-only',
    fetchPolicy: 'network-only',
  });

  const [openForm] = useOpenFormWithCloseConfirmation({ modal: true });

  const openCreateJobSiteModal = () => {
    openForm({
      checkForChange: (data) => !!data.dirty,
      form: (
        <NewCustomerJobSiteForm
          hideStatus
          customerId={customerId}
          customer={customer}
          onCancel={closeModal}
          onSubmitted={async (jobSiteId) => {
            getHaulingCustomerJobSitePair({
              variables: {
                filter: {
                  customerId,
                  jobSiteId,
                },
              },
            });

            getHaulingJobSite({
              variables: {
                filter: {
                  customerId,
                  jobSiteId,
                },
              },
            });

            closeModal();
          }}
        />
      ),
    });
  };

  const disabled =
    (orderType === OrderType.NonService ? !isObject(customer) : !customerTruck) ||
    (!initialJobSite && orderStatuses.includes(orderStatus));

  // Company's default JS must be hidden from options, and also hidden from input view (even if is selected)
  const filteredOptions = useMemo(
    () => options.filter((option) => option.value !== companyJobSiteId),
    [options, companyJobSiteId],
  );

  return (
    <SearchFieldWithNewEntity
      options={filteredOptions}
      name="jobSite"
      disabled={readOnly || disabled}
      required={customer?.jobSiteRequired}
      label={<Trans>Job Site</Trans>}
      onInputChange={(value) => {
        const onClean = !value || !jobSite;

        if (onClean || value !== jobSite?.fullAddress) {
          setInputDebounced(value);
          setOptions(jobSiteOptions);
        }
      }}
      onChange={(value) => {
        if (value) {
          if (value.popupNote) {
            showPopupNote(value.fullAddress, value.popupNote);
          }

          getHaulingCustomerJobSitePair({
            variables: { filter: { customerId, jobSiteId: value.id } },
          });
        } else {
          input.onChange({ target: { name: 'customerJobSite', value: null } });
        }

        if (onChange) {
          onChange(value);
        }
      }}
      mapValues={{
        mapFieldValueToFormValue(value) {
          return (value as CustomerJobSiteOption)?.jobSite;
        },
        mapFormValueToFieldValue(value) {
          const jobSite = (value as any) as CustomerJobSiteOption['jobSite'];

          return jobSite?.id;
        },
      }}
      onCreate={openCreateJobSiteModal}
      newEntityName={allowCreateNew ? t('Job Site') : undefined}
    />
  );
};
