import React, { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Checkbox, Layouts } from '@starlightpro/shared-components';
import { useFormik } from 'formik';
import { noop, startCase } from 'lodash-es';

import { Modal, Typography } from '@root/common';
import {
  Divider,
  Table,
  TableBody,
  TableCell,
  TableRow,
  TableTools,
} from '@root/common/TableTools';
import { BillableItemActionEnum } from '@root/consts';
import configurationStyle from '@root/pages/SystemConfiguration/css/styles.scss';
import { useStores } from '@hooks';

import { getValues, ServicesValues, validationSchema } from './formikData';
import { IIncludedServicesModal } from './types';

import styles from './css/styles.scss';

const rentalIncludedServiceActions = [
  BillableItemActionEnum.delivery,
  BillableItemActionEnum.service,
  BillableItemActionEnum.final,
];

export const SetIncludedServicesModal: React.FC<IIncludedServicesModal> = ({
  services,
  billableItemAction,
  equipmentItemId,
  isOpen,
  onClose,
  onSave,
}) => {
  const { billableServiceStore } = useStores();
  const { t } = useTranslation();

  const includedServices = useMemo(
    () =>
      billableServiceStore.sortedValues.filter(
        service =>
          rentalIncludedServiceActions.includes(service.action) &&
          service.equipmentItemId === equipmentItemId &&
          service.action !== billableItemAction,
      ),
    [billableItemAction, billableServiceStore.sortedValues, equipmentItemId],
  );

  const initialValues = useMemo(() => getValues(services), [services]);

  const formik = useFormik({
    validationSchema,
    initialValues,
    enableReinitialize: true,
    validateOnChange: false,
    initialErrors: {},
    onSubmit: noop,
    onReset: onClose,
  });

  const { values, setFieldValue } = formik;

  const handleItemToggle = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>, id: number) => {
      const value = e.target.checked;

      setFieldValue(`services.${id}`, value);
    },
    [setFieldValue],
  );

  const handleCheckAll = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const allServices = includedServices
        .map(service => service.id.toString())
        .reduce<ServicesValues>((servicesMap, id) => {
          servicesMap[id] = true;

          return servicesMap;
        }, {});

      setFieldValue('services', e.target.checked ? allServices : {});
    },
    [includedServices, setFieldValue],
  );

  const selectedServiceIds = useMemo(
    () =>
      Object.keys(values.services)
        .filter(id => values.services[id])
        .map(id => Number(id)),
    [values.services],
  );
  const indeterminate =
    selectedServiceIds.length > 0 && includedServices.length !== selectedServiceIds.length;

  return (
    <Modal isOpen={isOpen} onClose={onClose} className={styles.modal}>
      <Layouts.Padding padding="3" bottom="0">
        <Typography variant="headerThree">Select Included Services</Typography>
      </Layouts.Padding>

      <Layouts.Padding left="3" right="3">
        <Divider top />
      </Layouts.Padding>

      <Layouts.Box height="70%">
        <TableTools.ScrollContainer>
          <Table>
            <TableTools.Header>
              <TableTools.HeaderCell minWidth={50 + 48}>
                <Checkbox
                  id="serviceCheckbox"
                  name="serviceCheckbox"
                  value={includedServices.length === selectedServiceIds.length}
                  indeterminate={indeterminate}
                  onChange={handleCheckAll}
                />
                <Layouts.Padding left="1">Description</Layouts.Padding>
              </TableTools.HeaderCell>
              <TableTools.HeaderCell>{t('Text.Equipment')}</TableTools.HeaderCell>
              <TableTools.HeaderCell>{t('Text.Action')}</TableTools.HeaderCell>
              <TableTools.HeaderCell>Type</TableTools.HeaderCell>
            </TableTools.Header>
            <TableBody cells={4} loading={billableServiceStore.loading}>
              {includedServices.map(service => (
                <TableRow key={service.id} className={configurationStyle.customRow}>
                  <TableCell titleClassName={configurationStyle.tableCellTitle}>
                    <Layouts.Flex>
                      <Checkbox
                        id={`services.${service.id}`}
                        name={`services.${service.id}`}
                        value={values.services[service.id.toString()]}
                        onChange={e => handleItemToggle(e, service.id)}
                      />
                      <Layouts.Padding left="1">{service.description}</Layouts.Padding>
                    </Layouts.Flex>
                  </TableCell>
                  <TableCell titleClassName={configurationStyle.tableCellTitle}>
                    {startCase(service.equipmentItem?.description)}
                  </TableCell>
                  <TableCell titleClassName={configurationStyle.tableCellTitle}>
                    {service.action}
                  </TableCell>
                  <TableCell titleClassName={configurationStyle.tableCellTitle}>
                    {t(service.oneTime ? 'Text.OneTime' : 'Text.Recurring')}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableTools.ScrollContainer>
        <Layouts.Padding padding="4" left="5" right="5">
          <Layouts.Flex justifyContent="space-between">
            <Button type="reset" onClick={onClose}>
              {t('Text.Cancel')}
            </Button>
            <Button type="submit" variant="primary" onClick={() => onSave(selectedServiceIds)}>
              {t('Text.SaveChanges')}
            </Button>
          </Layouts.Flex>
        </Layouts.Padding>
      </Layouts.Box>
    </Modal>
  );
};
