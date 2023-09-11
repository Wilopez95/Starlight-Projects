import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useHistory } from 'react-router';
import { useFormikContext } from 'formik';
import { startCase } from 'lodash-es';
import { observer } from 'mobx-react-lite';

import { OrderIcon, ReselectIcon } from '@root/assets';
import { ClientRequestType, Paths } from '@root/consts';
import { pathToUrl } from '@root/helpers';
import { INewClientRequest } from '@root/pages/NewRequest/NewRequestForm/types';
import { useBusinessContext, useStores } from '@hooks';

import InfoBlock from '../InfoBlock';

const I18N_CLIENT_REQUEST_TYPE_PATH = 'consts.ClientRequestType.';

const BusinessLineInfoBlock: React.FC<{ readOnly?: boolean }> = ({ readOnly }) => {
  const { businessLineStore } = useStores();
  const { values, initialValues, setFormikState } = useFormikContext<INewClientRequest>();
  const history = useHistory();
  const { businessUnitId } = useBusinessContext();
  const { t } = useTranslation();

  const handleSelectAnotherBusinessLineClick = useCallback(() => {
    setFormikState(state => ({
      ...state,
      errors: {},
      values: {
        ...initialValues,
        customerId: state.values.customerId,
        jobSiteId: state.values.jobSiteId,
        type: ClientRequestType.Unknown,
        purchaseOrderId: state.values.purchaseOrderId,
      },
    }));

    const route = pathToUrl(Paths.RequestModule.Request, {
      businessUnit: businessUnitId,
    });

    history.replace(route);
  }, [businessUnitId, history, initialValues, setFormikState]);

  const handleSelectAnotherOrderTypeClick = useCallback(() => {
    setFormikState(state => ({
      ...state,
      errors: {},
      values: {
        ...initialValues,
        businessLineId: state.values.businessLineId,
        customerId: state.values.customerId,
        jobSiteId: state.values.jobSiteId,
        type: ClientRequestType.Unknown,
        purchaseOrderId: state.values.purchaseOrderId,
      },
    }));

    const route = pathToUrl(Paths.RequestModule.Request, {
      businessUnit: businessUnitId,
    });

    history.replace(route);
  }, [businessUnitId, history, initialValues, setFormikState]);

  const businessLine = businessLineStore.getById(values.businessLineId);

  const isSubscriptionOrNonServiceOrder = [
    ClientRequestType.SubscriptionOrder,
    ClientRequestType.SubscriptionNonService,
  ].includes(values.type);

  if (!businessLine) {
    return null;
  }

  const third =
    businessLineStore.values.length < 2 || readOnly || isSubscriptionOrNonServiceOrder
      ? {}
      : {
          icon: ReselectIcon,
          text: 'Select Another Business Line',
          onClick: handleSelectAnotherBusinessLineClick,
        };

  return (
    <InfoBlock
      firstBlock={{
        heading: 'Business Line & Service',
        title: t(`${I18N_CLIENT_REQUEST_TYPE_PATH}${values.type}`),
        lines: [startCase(businessLine.type)],
      }}
      thirdBlock={{
        ...third,
        semi:
          readOnly || isSubscriptionOrNonServiceOrder
            ? undefined
            : {
                text: 'Select Another Order Type',
                icon: OrderIcon,
                onClick: handleSelectAnotherOrderTypeClick,
              },
      }}
    />
  );
};

export default observer(BusinessLineInfoBlock);
