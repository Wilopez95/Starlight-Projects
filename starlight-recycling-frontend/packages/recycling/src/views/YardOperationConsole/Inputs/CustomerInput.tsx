import React, { FC, useEffect, useState } from 'react';
import { Trans } from '../../../i18n';

import { useField } from 'react-final-form';
import CustomerSearchField, {
  CustomerOption,
} from '../../../components/FinalForm/CustomerSearchField';
import { NewCustomerForm } from '../../CustomersView/CustomerForm';
import { closeModal } from '../../../components/Modals';
import { useOpenFormWithCloseConfirmation } from '@starlightpro/common';
import { useDebouncedHaulingCustomersRequest } from '../hooks/useDebouncedHaulingCustomersRequest';
import { CustomerFilter, CustomerType, HaulingCustomer } from '../../../graphql/api';
import { showPopupNote } from '../helpers/popupNote';

interface CustomerInputProps {
  required?: boolean;
  autoFocus?: boolean;
  onChange?: (value: CustomerOption) => void;
  /**
   * filter for the list of customers
   *
   * null - all
   * true - only active
   * false - only inactive
   */
  active?: boolean | null;
  allowCreateNew?: boolean;
  customerFilter?: CustomerFilter;
  ignoreWalkup?: boolean;
  disabled?: boolean;
}

export const CustomerInput: FC<CustomerInputProps> = ({
  onChange,
  autoFocus,
  required,
  customerFilter,
  allowCreateNew = true,
  disabled = false,
  ignoreWalkup,
}) => {
  const { input } = useField('customer', { subscription: { value: true } });
  const [hasOnlyOneOption, setHasOnlyOneOption] = useState(false);
  const [options, setOptions] = useState<CustomerOption[]>([]);
  const [openForm] = useOpenFormWithCloseConfirmation({ modal: true });

  const {
    customerOptions,
    setInputDebounced,
    refetch,
    isInitialQuery,
  } = useDebouncedHaulingCustomersRequest(customerFilter);

  useEffect(() => {
    if (ignoreWalkup) {
      setOptions(customerOptions.filter((option) => option.customer.type !== CustomerType.Walkup));
    } else {
      setOptions(customerOptions);
    }
  }, [customerOptions, ignoreWalkup, input.value, setOptions]);

  const handleShowPopup = (customer: HaulingCustomer) => {
    if (customer?.popupNote) {
      showPopupNote(customer.businessName!, customer.popupNote);
    }
  };

  // set default customer when impossible to create new one
  useEffect(() => {
    const isDefaultOptions = isInitialQuery && options.length === 1;

    if (isDefaultOptions && !allowCreateNew) {
      setHasOnlyOneOption(true);

      if (input.value) {
        return;
      }

      const value = options[0].customer;
      input.onChange({ target: { name: 'customer', value } });
      handleShowPopup(value as HaulingCustomer);
    }
  }, [allowCreateNew, isInitialQuery, input, options, onChange]);

  const openCreateNewCustomerModal = () => {
    openForm({
      form: (
        <NewCustomerForm
          onCancel={closeModal}
          onSubmitted={async (values, result) => {
            input.onChange({ target: { name: 'customer', value: result } });

            if (refetch) {
              refetch({
                variables: {
                  filter: {
                    query: result.businessName,
                  },
                },
              });
            }

            if (onChange) {
              onChange(result);
            }
          }}
        />
      ),
    });
  };

  return (
    <CustomerSearchField
      disabled={disabled || hasOnlyOneOption}
      allowNonOptionValues
      name="customer"
      data-cy="Customer Input"
      options={options}
      required={required}
      autoFocus={autoFocus}
      onChange={(value) => {
        handleShowPopup(value);

        if (onChange) {
          onChange(value);
        }
      }}
      onInputChange={setInputDebounced}
      label={<Trans>Search by customer name</Trans>}
      onCreate={openCreateNewCustomerModal}
      newEntityName={allowCreateNew ? 'customer' : undefined}
    />
  );
};
