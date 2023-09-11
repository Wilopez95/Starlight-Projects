import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Layouts, Select } from '@starlightpro/shared-components';

import { Modal, Typography } from '@root/common';
import { Divider } from '@root/common/TableTools';
import { useStores } from '@root/hooks';

import { IFormModal } from '../types';

import styles from './css/styles.scss';

const I18N_PATH = 'pages.JobSites.modals.AssignTaxDistrict.';

const SelectTaxDistrictModal: React.FC<IFormModal<number> & { excludeIds: number[] }> = ({
  isOpen,
  excludeIds,
  onClose,
  onFormSubmit,
}) => {
  const { t } = useTranslation();

  const [selectedId, setSelectedId] = useState<number | undefined>();
  const { taxDistrictStore } = useStores();

  const availableTaxDistricts = taxDistrictStore.allSortedValues
    .filter(district => !excludeIds.includes(district.id))
    .map(district => ({ value: district.id, label: district.description }));

  return (
    <Modal isOpen={isOpen} onClose={onClose} className={styles.modal}>
      <Layouts.Flex direction="column">
        <Layouts.Padding top="3" right="5" left="5">
          <Typography variant="headerThree">{t(`${I18N_PATH}Title`)}</Typography>
        </Layouts.Padding>
        <Layouts.Padding padding="5" bottom="2" top="2">
          <Select
            name="taxDistrictId"
            label={t(`${I18N_PATH}Label`)}
            placeholder={t(`${I18N_PATH}Placeholder`)}
            options={availableTaxDistricts}
            value={selectedId}
            onSelectChange={(_, id) => setSelectedId(id as number)}
          />
        </Layouts.Padding>
        <Divider />
        <Layouts.Padding padding="4" left="5" right="5">
          <Layouts.Flex justifyContent="space-between">
            <Button onClick={onClose}>{t(`${I18N_PATH}Actions.Cancel`)}</Button>
            <Button
              type="submit"
              variant="primary"
              disabled={!selectedId}
              onClick={() => onFormSubmit(selectedId as number)}
            >
              {t(`${I18N_PATH}Actions.Assign`)}
            </Button>
          </Layouts.Flex>
        </Layouts.Padding>
      </Layouts.Flex>
    </Modal>
  );
};

export default SelectTaxDistrictModal;
