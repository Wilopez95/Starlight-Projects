import React, { useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Layouts } from '@starlightpro/shared-components';
import { getIn, useFormikContext } from 'formik';
import { observer } from 'mobx-react-lite';

import { DescriptiveTooltip, FormInput, RadioButton } from '@root/common';
import PurchaseOrderSelect from '@root/components/PurchaseOrderSelect/PurchaseOrderSelect';
import { ClientRequestType } from '@root/consts';
import { IConfigurableOrder, IPurchaseOrder } from '@root/types';
import { useFetchAndCreatePONumbers } from '@hooks';

import { IPurchaseOrderSection } from './types';

const I18N_PATH = 'components.PurchaseOrderSection.Text.';

const PurchaseOrderSection: React.FC<IPurchaseOrderSection> = ({
  customerId,
  purchaseOrderId,
  disabled,
  basePath,
  fullSizeModal,
}) => {
  const { t } = useTranslation();
  const { values, errors, handleChange, setFieldValue } = useFormikContext<IConfigurableOrder>();

  const purchaseOrderPath = `${basePath ? `${basePath}.` : ''}purchaseOrder`;
  const isOneTimePOPath = `${basePath ? `${basePath}.` : ''}isOneTimePO`;
  const purchaseOrderIdPath = `${basePath ? `${basePath}.` : ''}purchaseOrderId`;
  const oneTimePurchaseOrderNumberPath = `${
    basePath ? `${basePath}.` : ''
  }oneTimePurchaseOrderNumber`;

  const isOrderRequest = values.type === ClientRequestType.OrderRequest;

  const purchaseOrder: IPurchaseOrder | null = getIn(values, purchaseOrderPath, null);
  const selectedPurchaseOrders = useMemo(() => {
    return purchaseOrder ? [purchaseOrder] : [];
  }, [purchaseOrder]);

  const { purchaseOrderOptions, handleCreatePurchaseOrder } = useFetchAndCreatePONumbers({
    customerId,
    selectedPurchaseOrders,
    isOrderRequest,
  });

  useEffect(() => {
    if (purchaseOrderId) {
      setFieldValue(purchaseOrderIdPath, purchaseOrderId);
    }
  }, [customerId, purchaseOrderId, setFieldValue, purchaseOrderIdPath]);

  return (
    <>
      <Layouts.Margin top="0.5" bottom="0.5">
        <Layouts.Flex>
          <Layouts.Margin right="2">
            <RadioButton
              name={isOneTimePOPath}
              type="radio"
              onChange={() => setFieldValue(isOneTimePOPath, false)}
              value={!getIn(values, isOneTimePOPath)}
              disabled={disabled}
            >
              {t(`${I18N_PATH}SelectPONumber`)}
            </RadioButton>
          </Layouts.Margin>
          <Layouts.Flex alignItems="center">
            <RadioButton
              name={isOneTimePOPath}
              type="radio"
              onChange={() => setFieldValue(isOneTimePOPath, true)}
              value={getIn(values, isOneTimePOPath)}
              disabled={disabled}
            >
              {t(`${I18N_PATH}OneTimePO`)}
            </RadioButton>
            <Layouts.Margin left="0.5">
              <DescriptiveTooltip position="top" text={t(`${I18N_PATH}OneTimePOTooltip`)} />
            </Layouts.Margin>
          </Layouts.Flex>
        </Layouts.Flex>
      </Layouts.Margin>
      {!getIn(values, isOneTimePOPath) ? (
        <PurchaseOrderSelect
          fullSizeModal={fullSizeModal}
          placeholder={t(`${I18N_PATH}SelectPONumber`)}
          ariaLabel={t(`${I18N_PATH}SelectPONumber`)}
          name={purchaseOrderIdPath}
          options={purchaseOrderOptions}
          value={getIn(values, purchaseOrderIdPath)}
          error={getIn(errors, purchaseOrderIdPath)}
          onSelectChange={setFieldValue}
          onCreatePurchaseOrder={handleCreatePurchaseOrder}
          disabled={disabled}
        />
      ) : (
        <FormInput
          placeholder={t(`${I18N_PATH}EnterPONumber`)}
          ariaLabel={t(`${I18N_PATH}EnterPONumber`)}
          name={oneTimePurchaseOrderNumberPath}
          value={getIn(values, oneTimePurchaseOrderNumberPath)}
          error={getIn(errors, oneTimePurchaseOrderNumberPath)}
          onChange={handleChange}
          disabled={disabled}
        />
      )}
    </>
  );
};

export default observer(PurchaseOrderSection);
