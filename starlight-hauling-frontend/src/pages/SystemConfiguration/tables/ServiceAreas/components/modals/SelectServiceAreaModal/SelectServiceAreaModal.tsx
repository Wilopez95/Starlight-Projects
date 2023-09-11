import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Button, ISelectOption, Layouts, Select } from '@starlightpro/shared-components';
import { noop } from 'lodash-es';
import { observer } from 'mobx-react-lite';

import { Modal, Typography } from '@root/common';
import { useStores } from '@root/hooks';

import { ISelectServiceAreaModal } from './types';

import styles from './css/styles.scss';

const SelectAreaModal: React.FC<ISelectServiceAreaModal> = ({
  isOpen,
  serviceAreasList,
  onClose,
  onSelect,
}) => {
  const { businessLineStore } = useStores();
  const [serviceAreaId, selectServiceAreaId] = useState<number | undefined>();

  useEffect(() => {
    businessLineStore.request();
  }, [businessLineStore]);

  useEffect(() => {
    selectServiceAreaId(serviceAreasList[0]?.id);
  }, [serviceAreasList]);

  const selectOptions: ISelectOption[] = useMemo(
    () =>
      serviceAreasList
        .filter(item => item.active)
        .map(item => {
          const label = `${
            businessLineStore.sortedValues.find(elem => elem.id === +item.businessLineId)?.name ??
            ''
          }  /  ${item.name}`;

          return {
            label,
            value: item.id,
          };
        }),
    [serviceAreasList, businessLineStore.sortedValues],
  );

  const handleUseClick = useCallback(() => {
    if (serviceAreaId) {
      onSelect(serviceAreaId);
    }
    onClose();
  }, [serviceAreaId, onSelect, onClose]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} className={styles.modal}>
      <Layouts.Padding padding="3" bottom="2">
        <Typography variant="headerThree">Use Polygon from Another Service Area</Typography>

        <Layouts.Padding top="3" bottom="2">
          <Layouts.Margin bottom="1">
            <Typography
              as="label"
              htmlFor="serviceAreaId"
              variant="bodyMedium"
              color="secondary"
              shade="light"
            >
              Select the service area from which you want to use polygons.
            </Typography>
          </Layouts.Margin>
          {selectOptions.length ? (
            <Select
              name="serviceAreaId"
              options={selectOptions}
              value={serviceAreaId}
              onSelectChange={(_, value) => selectServiceAreaId(value as number)}
            />
          ) : (
            <Select
              placeholder="No Service Areas Created"
              name="serviceAreaId"
              options={selectOptions}
              onSelectChange={noop}
              disabled={true}
            />
          )}
        </Layouts.Padding>
        <Layouts.Padding top="2" bottom="1">
          <Layouts.Flex justifyContent="space-between" className={styles.buttonsContainer}>
            <Button onClick={onClose}>Cancel</Button>
            <Button variant="primary" onClick={handleUseClick} disabled={!serviceAreaId}>
              Use
            </Button>
          </Layouts.Flex>
        </Layouts.Padding>
      </Layouts.Padding>
    </Modal>
  );
};

export default observer(SelectAreaModal);
