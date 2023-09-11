import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Accordion, Button, ISelectOption, Layouts, Select } from '@starlightpro/shared-components';
import { FieldArray, getIn, useFormikContext } from 'formik';
import { isEmpty } from 'lodash-es';
import { observer } from 'mobx-react-lite';

import { DeleteIcon, PlusIcon } from '@root/assets';
import { FormInput, Typography } from '@root/common';
import { useStores, useToggle } from '@root/hooks';
import { useIntl } from '@root/i18n/useIntl';
import { ITruckAndDriverCost, ITruckTypeCost } from '@root/types';

import { defaultValueTruckTypeCost } from '../formikData';

import styles from '../css/styles.scss';

const I18N_PATH = 'pages.SystemConfiguration.tables.TrucksAndDriversCosts.QuickView.Text.';

const TruckTypeCosts: React.FC = () => {
  const { truckTypeStore } = useStores();
  const { t } = useTranslation();
  const formik = useFormikContext<ITruckAndDriverCost>();
  const [isOpen, toggleOpen] = useToggle();
  const { formatCurrency } = useIntl();

  const { values, errors, handleChange, setFieldValue } = formik;

  const placeholder = formatCurrency(0);

  const truckTypeOptions: ISelectOption[] = truckTypeStore.values
    .filter(el => !values.truckTypeCosts?.find(cost => cost?.truckTypeId === +el.id))
    .map(elem => ({
      value: elem.id,
      label: elem.description,
    }));

  const getTruckTypeOptions = (id?: number) => {
    const truckTypeCurrent = truckTypeStore.values.find(value => value.id === id);

    if (!truckTypeCurrent) {
      return truckTypeOptions;
    }

    return [
      {
        value: truckTypeCurrent.id,
        label: truckTypeCurrent.description,
      },
      ...truckTypeOptions,
    ];
  };

  const handleAddNewTruckTypeCost = useCallback(
    (e: React.MouseEvent<HTMLButtonElement, MouseEvent>, push: (data: ITruckTypeCost) => void) => {
      e.stopPropagation();
      if (!isOpen) {
        toggleOpen();
      }
      push(defaultValueTruckTypeCost);
    },
    [isOpen, toggleOpen],
  );

  return (
    <FieldArray name="truckTypeCosts">
      {({ push, remove }) => (
        <Accordion
          isOpen={isOpen || !isEmpty(errors.truckTypeCosts)}
          toggleOpen={toggleOpen}
          label={t(`${I18N_PATH}TruckTypes`)}
          actionButton={
            <Layouts.Margin left="auto" right="1">
              <Button
                variant="none"
                disabled={!truckTypeOptions.length}
                onClick={e => handleAddNewTruckTypeCost(e, push)}
              >
                <Layouts.Flex alignItems="center" justifyContent="center">
                  <Layouts.IconLayout height="12px" width="12px">
                    <PlusIcon />
                  </Layouts.IconLayout>
                  <Typography color="information" cursor="pointer" variant="bodyMedium">
                    {t(`${I18N_PATH}AddTruckType`)}
                  </Typography>
                </Layouts.Flex>
              </Button>
            </Layouts.Margin>
          }
        >
          <Layouts.Box width="100%" backgroundColor="white">
            <Layouts.Padding top="2" bottom="2">
              <Layouts.Grid columnGap="2" rowGap="1" columns="3fr repeat(5, 1fr)">
                <Typography
                  color="secondary"
                  as="label"
                  shade="light"
                  variant="headerFive"
                  textTransform="uppercase"
                >
                  {t(`${I18N_PATH}Description`)}
                </Typography>
                {values.detailedCosts ? (
                  <>
                    <Typography
                      color="secondary"
                      as="label"
                      shade="light"
                      variant="headerFive"
                      textTransform="uppercase"
                      textAlign="right"
                    >
                      {t(`${I18N_PATH}Fuel`)}
                    </Typography>
                    <Typography
                      color="secondary"
                      as="label"
                      shade="light"
                      variant="headerFive"
                      textTransform="uppercase"
                      textAlign="right"
                    >
                      {t(`${I18N_PATH}Misc`)}
                    </Typography>
                    <Typography
                      color="secondary"
                      as="label"
                      shade="light"
                      variant="headerFive"
                      textTransform="uppercase"
                      textAlign="right"
                    >
                      {t(`${I18N_PATH}Insurance`)}
                    </Typography>
                    <Typography
                      color="secondary"
                      as="label"
                      shade="light"
                      variant="headerFive"
                      textTransform="uppercase"
                      textAlign="right"
                    >
                      {t(`${I18N_PATH}Maintenance`)}
                    </Typography>
                    <Typography
                      color="secondary"
                      as="label"
                      shade="light"
                      variant="headerFive"
                      textTransform="uppercase"
                      textAlign="right"
                    >
                      {t(`${I18N_PATH}Depreciation`)}
                    </Typography>
                  </>
                ) : (
                  <Layouts.Cell width={1} left={6} justifySelf="flex-end">
                    <Typography
                      color="secondary"
                      as="label"
                      shade="light"
                      variant="headerFive"
                      textTransform="uppercase"
                    >
                      {t(`${I18N_PATH}COGS/H`)}
                    </Typography>
                  </Layouts.Cell>
                )}
                {values?.truckTypeCosts?.map((truckTypeCost, index) => {
                  return (
                    <React.Fragment key={index}>
                      <Layouts.Flex>
                        <DeleteIcon
                          role="button"
                          tabIndex={0}
                          onClick={() => remove(index)}
                          className={styles.removeIcon}
                        />
                        <Select
                          name={`truckTypeCosts[${index}].truckTypeId`}
                          placeholder={t(`${I18N_PATH}Select`)}
                          options={getTruckTypeOptions(truckTypeCost.truckTypeId)}
                          error={getIn(errors, `truckTypeCosts[${index}].truckTypeId`)}
                          value={truckTypeCost.truckTypeId}
                          onSelectChange={setFieldValue}
                          nonClearable
                        />
                      </Layouts.Flex>
                      {values.detailedCosts ? (
                        <>
                          <FormInput
                            type="number"
                            placeholder={placeholder}
                            name={`truckTypeCosts[${index}].fuelCost`}
                            inputTextAlign="right"
                            value={truckTypeCost.fuelCost}
                            onChange={handleChange}
                            error={getIn(errors, `truckTypeCosts[${index}].fuelCost`)}
                          />
                          <FormInput
                            type="number"
                            placeholder={placeholder}
                            name={`truckTypeCosts[${index}].miscAverageCost`}
                            inputTextAlign="right"
                            value={truckTypeCost.miscAverageCost}
                            onChange={handleChange}
                            error={getIn(errors, `truckTypeCosts[${index}].miscAverageCost`)}
                          />
                          <FormInput
                            type="number"
                            placeholder={placeholder}
                            name={`truckTypeCosts[${index}].insuranceCost`}
                            inputTextAlign="right"
                            value={truckTypeCost.insuranceCost}
                            onChange={handleChange}
                            error={getIn(errors, `truckTypeCosts[${index}].insuranceCost`)}
                          />
                          <FormInput
                            type="number"
                            placeholder={placeholder}
                            name={`truckTypeCosts[${index}].maintenanceCost`}
                            inputTextAlign="right"
                            value={truckTypeCost.maintenanceCost}
                            onChange={handleChange}
                            error={getIn(errors, `truckTypeCosts[${index}].maintenanceCost`)}
                          />
                          <FormInput
                            type="number"
                            placeholder={placeholder}
                            name={`truckTypeCosts[${index}].depreciationCost`}
                            inputTextAlign="right"
                            value={truckTypeCost.depreciationCost}
                            onChange={handleChange}
                            error={getIn(errors, `truckTypeCosts[${index}].depreciationCost`)}
                          />
                        </>
                      ) : (
                        <Layouts.Cell width={1} left={6} justifySelf="flex-end">
                          <FormInput
                            type="number"
                            placeholder={placeholder}
                            name={`truckTypeCosts[${index}].truckAverageCost`}
                            inputTextAlign="right"
                            value={truckTypeCost.truckAverageCost}
                            onChange={handleChange}
                            error={getIn(errors, `truckTypeCosts[${index}].truckAverageCost`)}
                          />
                        </Layouts.Cell>
                      )}
                    </React.Fragment>
                  );
                })}
              </Layouts.Grid>
            </Layouts.Padding>
          </Layouts.Box>
        </Accordion>
      )}
    </FieldArray>
  );
};

export default observer(TruckTypeCosts);
