import React, { useEffect, useMemo } from 'react';
import { ISelectOption, Select } from '@starlightpro/shared-components';
import { observer } from 'mobx-react-lite';

import { useStores } from '@root/hooks';

import { IContactSelect } from './types';

const ContactSelect: React.FC<IContactSelect> = ({ customerId, activeOnly = true, ...props }) => {
  const { contactStore } = useStores();

  useEffect(() => {
    if (customerId) {
      contactStore.requestByCustomer({ customerId, activeOnly });
    }
  }, [activeOnly, contactStore, customerId]);

  const contactOptions: ISelectOption[] = useMemo(
    () =>
      contactStore.values.map(contact => ({
        label: contact?.name ?? '',
        value: contact.id,
        hint: contact.jobTitle ?? '',
      })),
    [contactStore.values],
  );

  return <Select {...props} options={contactOptions} />;
};

export default observer(ContactSelect);
