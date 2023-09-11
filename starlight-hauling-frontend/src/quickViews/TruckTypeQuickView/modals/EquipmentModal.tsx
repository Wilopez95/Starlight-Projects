import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Checkbox, Layouts } from '@starlightpro/shared-components';
import { useFormikContext } from 'formik';
import { observer } from 'mobx-react-lite';

import { Typography } from '@root/common';
import {
  Divider,
  Table,
  TableBody,
  TableCell,
  TableRow,
  TableTools,
} from '@root/common/TableTools';
import configurationStyle from '@root/pages/SystemConfiguration/css/styles.scss';
import { ITruckFormikData } from '@root/types';
import { useCleanup, useStores } from '@hooks';

import { ModalWrapper } from './styles';
import { ITrucksModal } from './types';

const I18N_PATH = 'pages.SystemConfiguration.tables.TruckTypes.Text.';

const EquipmentModal: React.FC<ITrucksModal> = ({ isOpen, onClose, businessLineId, isNew }) => {
  const { equipmentItemStore } = useStores();
  const { t } = useTranslation();
  const [equipmentValues, setEquipmentValues] = useState<Omit<ITruckFormikData, 'businessLines'>[]>(
    [],
  );

  useCleanup(equipmentItemStore);
  const formik = useFormikContext<ITruckFormikData>();

  const { values, setFieldValue } = formik;
  const selectedEquipments = values?.businessLines.find(
    ({ id }: { id: number }) => id === businessLineId,
  )?.equipmentItems;

  useEffect(() => {
    if (businessLineId && isOpen) {
      equipmentItemStore.request({ businessLineId, activeOnly: true });
    }
  }, [equipmentItemStore, businessLineId, isOpen]);

  const handleClose = useCallback(() => {
    setEquipmentValues([]);
    if (onClose) {
      onClose();
    }
    equipmentItemStore.cleanup();
  }, [equipmentItemStore, onClose]);

  const handleSubmit = useCallback(() => {
    const BLindex = values.businessLines.findIndex(
      ({ id }: { id: number }) => id === businessLineId,
    );

    if (BLindex === -1) {
      return;
    }
    setFieldValue(
      `businessLines[${BLindex}].equipmentItems`,
      equipmentValues.filter(({ active }: { active: boolean }) => active),
    );
    handleClose();
  }, [equipmentValues, setFieldValue, values.businessLines, businessLineId, handleClose]);

  useEffect(() => {
    const arr = equipmentItemStore?.values?.map(
      ({ id: equipmentId, description }: { id: number; description: string }) => ({
        id: equipmentId,
        description,
        active:
          !isNew &&
          !!selectedEquipments?.some(({ id }: { id: number }) => {
            return id === equipmentId;
          }),
      }),
    );

    setEquipmentValues(arr);
  }, [equipmentItemStore, equipmentItemStore.values, selectedEquipments, isNew]);

  const isAllChecked =
    equipmentValues.filter(({ active }: { active: boolean }) => !active).length === 0;

  const handleCheckAll = useCallback(() => {
    const updatedValues = equipmentValues.map(elem => ({ ...elem, active: !isAllChecked }));

    setEquipmentValues(updatedValues);
  }, [isAllChecked, equipmentValues]);

  const indeterminate =
    !isAllChecked && equipmentValues.filter(({ active }: { active: boolean }) => active).length > 0;

  const handleChange = useCallback(
    (idx: number) => {
      const updatedValues = [...equipmentValues];

      updatedValues[idx].active = !updatedValues[idx].active;
      setEquipmentValues(updatedValues);
    },
    [equipmentValues],
  );

  return (
    <ModalWrapper isOpen={isOpen} onClose={handleClose}>
      <Layouts.Padding padding="3" bottom="0">
        <Typography variant="headerThree">{t(`${I18N_PATH}SetEquipment`)}</Typography>
      </Layouts.Padding>

      <Layouts.Padding left="3" right="3">
        <Divider top />
      </Layouts.Padding>

      <Layouts.Box height="60%">
        <TableTools.ScrollContainer>
          <Table>
            <TableTools.Header>
              <TableTools.HeaderCell minWidth={50 + 48}>
                <Checkbox
                  id="serviceCheckbox"
                  name="serviceCheckbox"
                  value={isAllChecked}
                  indeterminate={indeterminate}
                  onChange={handleCheckAll}
                >
                  <Layouts.Padding left="1">{t(`${I18N_PATH}Equipment`)}</Layouts.Padding>
                </Checkbox>
              </TableTools.HeaderCell>
            </TableTools.Header>
            <TableBody cells={4} loading={equipmentItemStore.loading}>
              {equipmentValues.length > 0 ? (
                equipmentValues.map(
                  ({ id, description }: { id: number; description: string }, idx: number) => (
                    <TableRow
                      key={`${id}-${idx}-${description}`}
                      className={configurationStyle.customRow}
                    >
                      <TableCell titleClassName={configurationStyle.tableCellTitle}>
                        <Layouts.Flex>
                          <Checkbox
                            name={`equipmentValues[${idx}].active`}
                            value={equipmentValues[idx].active}
                            onChange={() => handleChange(idx)}
                          >
                            <Layouts.Padding left="1">{description}</Layouts.Padding>
                          </Checkbox>
                        </Layouts.Flex>
                      </TableCell>
                    </TableRow>
                  ),
                )
              ) : (
                <TableRow>
                  <TableCell center>
                    <Layouts.Flex>
                      <Typography variant="headerFour">
                        <Layouts.Margin top="5">{t(`${I18N_PATH}NoEquipment`)}</Layouts.Margin>
                      </Typography>
                    </Layouts.Flex>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableTools.ScrollContainer>
        <Layouts.Padding padding="2" left="5" right="5">
          <Layouts.Flex justifyContent="space-between">
            <Button type="reset" onClick={handleClose}>
              {t('Text.Cancel')}
            </Button>
            <Button type="submit" variant="primary" onClick={handleSubmit}>
              {t('Text.SaveChanges')}
            </Button>
          </Layouts.Flex>
        </Layouts.Padding>
      </Layouts.Box>
    </ModalWrapper>
  );
};

export default observer(EquipmentModal);
