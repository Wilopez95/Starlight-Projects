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
const MaterialModal: React.FC<ITrucksModal> = ({ isOpen, onClose, businessLineId, isNew }) => {
  const { materialStore } = useStores();
  const { t } = useTranslation();
  const [materialValues, setMaterialValues] = useState<Omit<ITruckFormikData, 'businessLines'>[]>(
    [],
  );

  useCleanup(materialStore);
  const formik = useFormikContext<ITruckFormikData>();
  const { values, setFieldValue } = formik;
  const selectedMaterials = values?.businessLines.find(
    ({ id }: { id: number }) => id === businessLineId,
  )?.materials;

  useEffect(() => {
    materialStore.cleanup();
    if (businessLineId && isOpen) {
      materialStore.request({ businessLineId, activeOnly: true });
    }
  }, [materialStore, businessLineId, isOpen]);

  const handleClose = useCallback(() => {
    setMaterialValues([]);
    materialStore.cleanup();
    if (onClose) {
      onClose();
    }
  }, [materialStore, onClose]);

  const handleSubmit = useCallback(() => {
    const BLindex = values.businessLines.findIndex(
      ({ id }: { id: number }) => id === businessLineId,
    );

    if (BLindex === -1) {
      return;
    }
    setFieldValue(
      `businessLines[${BLindex}].materials`,
      materialValues.filter(({ active }: { active: boolean }) => active),
    );
    handleClose();
  }, [materialValues, setFieldValue, values.businessLines, businessLineId, handleClose]);

  useEffect(() => {
    const materialArray = materialStore?.values?.map(
      ({ id: materialID, description }: { id: number; description: string }) => ({
        id: materialID,
        description,
        active:
          !isNew &&
          !!selectedMaterials?.some(({ id }: { id: number }) => {
            return id === materialID;
          }),
      }),
    );

    setMaterialValues(materialArray);
  }, [materialStore, materialStore.values, selectedMaterials, isNew]);
  const isAllChecked =
    materialValues.filter(({ active }: { active: boolean }) => !active).length === 0;

  const handleCheckAll = useCallback(() => {
    const updatedValues = materialValues.map(elem => ({ ...elem, active: !isAllChecked }));

    setMaterialValues(updatedValues);
  }, [isAllChecked, materialValues]);

  const indeterminate =
    !isAllChecked && materialValues.filter(({ active }: { active: boolean }) => active).length > 0;

  const handleChange = useCallback(
    (idx: number) => {
      const updatedValues = [...materialValues];

      updatedValues[idx].active = !updatedValues[idx].active;
      setMaterialValues(updatedValues);
    },
    [materialValues],
  );

  return (
    <ModalWrapper isOpen={isOpen} onClose={onClose}>
      <Layouts.Padding padding="3" bottom="0">
        <Typography variant="headerThree">{t(`${I18N_PATH}SetMaterial`)}</Typography>
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
                  <Layouts.Padding left="1">{t(`${I18N_PATH}Material`)}</Layouts.Padding>
                </Checkbox>
              </TableTools.HeaderCell>
            </TableTools.Header>
            <TableBody cells={4} loading={materialStore.loading}>
              {materialValues.length > 0 ? (
                materialValues.map(
                  ({ id, description }: { id: number; description: string }, idx: number) => (
                    <TableRow
                      key={`${id}-${idx}-${description}`}
                      className={configurationStyle.customRow}
                    >
                      <TableCell titleClassName={configurationStyle.tableCellTitle}>
                        <Layouts.Flex>
                          <Checkbox
                            name={`materialValues[${idx}].active`}
                            value={materialValues[idx].active}
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
                        <Layouts.Margin top="5">{t(`${I18N_PATH}NoMaterial`)}</Layouts.Margin>
                      </Typography>
                    </Layouts.Flex>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableTools.ScrollContainer>
        <Layouts.Margin margin="2" left="5" right="5">
          <Layouts.Flex justifyContent="space-between">
            <Button type="reset" onClick={handleClose}>
              {t('Text.Cancel')}
            </Button>
            <Button type="submit" variant="primary" onClick={handleSubmit}>
              {t('Text.SaveChanges')}
            </Button>
          </Layouts.Flex>
        </Layouts.Margin>
      </Layouts.Box>
    </ModalWrapper>
  );
};

export default observer(MaterialModal);
