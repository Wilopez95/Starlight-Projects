import React, { useCallback, useMemo } from 'react';
import {
  ISelectOptionGroup,
  MultiSelect,
  Select,
  SelectValue,
} from '@starlightpro/shared-components';

import NewPurchaseOrderModal from '@root/components/modals/NewPurchaseOrder/NewPurchaseOrder';
import { IPurchaseOrder } from '@root/types';
import { useToggle } from '@hooks';

import NoSelectOptionsMessage from './components/NoSelectOptionsMessage/NoSelectOptionsMessage';
import PurchaseOrderFieldFooter from './components/PurchaseOrderFieldFooter/PurchaseOrderFieldFooter';
import { IPurchaseOrderSelect } from './types';

const PurchaseOrderSelect: React.FC<IPurchaseOrderSelect> = ({
  label,
  ariaLabel,
  placeholder,
  name,
  value,
  error,
  options,
  onSelectChange,
  isMulti,
  disabled,
  onCreatePurchaseOrder,
  fullSizeModal,
}) => {
  const [isNewPurchaseOrderModalOpen, toggleIsNewPurchaseOrderModalOpen] = useToggle();

  const purchaseOrderOptions: ISelectOptionGroup[] = useMemo(() => {
    return [
      {
        options,
        footer: <PurchaseOrderFieldFooter />,
        onFooterClick: toggleIsNewPurchaseOrderModalOpen,
      },
    ];
  }, [options, toggleIsNewPurchaseOrderModalOpen]);

  const handleCreatePurchaseOrder = useCallback(
    (values: IPurchaseOrder) => {
      onCreatePurchaseOrder(values);
      toggleIsNewPurchaseOrderModalOpen();
    },
    [onCreatePurchaseOrder, toggleIsNewPurchaseOrderModalOpen],
  );

  return (
    <>
      <NewPurchaseOrderModal
        fullSize={fullSizeModal}
        isOpen={isNewPurchaseOrderModalOpen}
        onFormSubmit={handleCreatePurchaseOrder}
        onClose={toggleIsNewPurchaseOrderModalOpen}
      />
      {isMulti ? (
        <MultiSelect
          label={label}
          ariaLabel={ariaLabel}
          placeholder={placeholder}
          name={name}
          value={value as SelectValue[]}
          error={error}
          components={{
            NoOptionsMessage: () => (
              <NoSelectOptionsMessage onClick={toggleIsNewPurchaseOrderModalOpen} />
            ),
          }}
          options={purchaseOrderOptions}
          onSelectChange={onSelectChange}
          disabled={disabled}
        />
      ) : (
        <Select
          label={label}
          ariaLabel={ariaLabel}
          placeholder={placeholder}
          name={name}
          value={value as SelectValue}
          error={error}
          components={{
            NoOptionsMessage: () => (
              <NoSelectOptionsMessage onClick={toggleIsNewPurchaseOrderModalOpen} />
            ),
          }}
          options={purchaseOrderOptions}
          onSelectChange={onSelectChange}
          disabled={disabled}
        />
      )}
    </>
  );
};

export default PurchaseOrderSelect;
