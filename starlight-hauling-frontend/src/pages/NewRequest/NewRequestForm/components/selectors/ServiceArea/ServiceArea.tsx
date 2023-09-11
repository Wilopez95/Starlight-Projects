import React, { useEffect, useMemo } from 'react';
import { Layouts, Select } from '@starlightpro/shared-components';
import { useFormikContext } from 'formik';
import { observer } from 'mobx-react-lite';

import { ValidationMessageBlock } from '@root/common';
import { ClientRequestType } from '@root/consts';
import { INewClientRequest } from '@root/pages/NewRequest/NewRequestForm/types';
import { useBusinessContext, useStores } from '@hooks';

import { IServiceAreaSection } from './types';

const ServiceAreaSelector: React.FC<IServiceAreaSection> = ({ secondary, readOnly = false }) => {
  const { serviceAreaStore, jobSiteStore } = useStores();
  const { businessUnitId } = useBusinessContext();

  const selectedJobSite = jobSiteStore.selectedEntity;
  const { values, errors, setFieldValue } = useFormikContext<INewClientRequest>();

  const isSubscriptionOrNonServiceOrder = [
    ClientRequestType.SubscriptionOrder,
    ClientRequestType.SubscriptionNonService,
  ].includes(values.type);

  useEffect(() => {
    if (selectedJobSite) {
      serviceAreaStore.requestByJobSite({
        jobSiteId: selectedJobSite.id,
        businessUnitId,
        businessLineId: values.businessLineId,
        activeOnly: true,
      });
    }
  }, [serviceAreaStore, businessUnitId, values.businessLineId, selectedJobSite]);

  useEffect(() => {
    if (secondary) {
      return;
    }

    const matchedServiceArea = serviceAreaStore.values.find(
      serviceArea => serviceArea.defaultMatch,
    );

    setFieldValue('serviceAreaId', matchedServiceArea?.id);
  }, [serviceAreaStore.values, secondary, setFieldValue]);

  const serviceAreaOptions = useMemo(
    () =>
      serviceAreaStore.values.map(serviceArea => ({
        label: serviceArea.name,
        value: serviceArea.id,
      })),
    [serviceAreaStore.values],
  );

  return (
    <>
      {!values.serviceAreaId && !readOnly ? (
        <Layouts.Margin bottom="2">
          <ValidationMessageBlock color="primary" shade="desaturated" textColor="secondary">
            The selected Job Site is not assigned to any Service Area.
          </ValidationMessageBlock>
        </Layouts.Margin>
      ) : null}

      <Select
        name="serviceAreaId"
        label="Service Area"
        placeholder={readOnly ? 'No service area' : 'Select service area'}
        options={serviceAreaOptions}
        value={values.serviceAreaId}
        error={errors.serviceAreaId}
        onSelectChange={setFieldValue}
        disabled={readOnly || isSubscriptionOrNonServiceOrder}
      />
    </>
  );
};

export default observer(ServiceAreaSelector);
