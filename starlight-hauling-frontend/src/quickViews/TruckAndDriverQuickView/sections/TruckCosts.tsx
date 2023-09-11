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
import { ITruckAndDriverCost, ITruckCost } from '@root/types';

import { defaultValueTruckCost } from '../formikData';

import styles from '../css/styles.scss';

const I18N_PATH = 'pages.SystemConfiguration.tables.TrucksAndDriversCosts.QuickView.Text.';

const TruckCosts: React.FC = () => {
  const { truckStore } = useStores();
  const { t } = useTranslation();
  const [isOpen, toggleOpen] = useToggle();
  const { formatCurrency } = useIntl();
  const formik = useFormikContext<ITruckAndDriverCost>();

  const { values, errors, handleChange, setFieldValue } = formik;

  const placeholder = formatCurrency(0);

  const truckOptions: ISelectOption[] = truckStore.values
    .filter(el => !values.truckCosts?.find(cost => cost?.truckId === +el.id))
    .map(elem => ({
      value: elem.id,
      label: elem.description,
    }));

  const getTruckOptions = (id?: number) => {
    const truckCurrent = truckStore.values.find(value => value.id === id);

    if (!truckCurrent) {
      return truckOptions;
    }

    return [
      {
        value: truckCurrent.id,
        label: truckCurrent.description,
      },
      ...truckOptions,
    ];
  };

  const handleAddNewTruckCost = useCallback(
    (e: React.MouseEvent<HTMLButtonElement, MouseEvent>, push: (data: ITruckCost) => void) => {
      e.stopPropagation();
      if (!isOpen) {
        toggleOpen();
      }
      push(defaultValueTruckCost);
    },
    [isOpen, toggleOpen],
  );

  return (
    <FieldArray name="truckCosts">
      {({ push, remove }) => (
        <Accordion
          isOpen={isOpen || !isEmpty(errors.truckCosts)}
          toggleOpen={toggleOpen}
          label={t(`${I18N_PATH}Trucks`)}
          actionButton={
            <Layouts.Margin left="auto" right="1">
              <Button
                variant="none"
                disabled={!truckOptions.length}
                onClick={e => handleAddNewTruckCost(e, push)}
              >
                <Layouts.Flex alignItems="center" justifyContent="center">
                  <Layouts.IconLayout height="12px" width="12px">
                    <PlusIcon />
                  </Layouts.IconLayout>
                  <Typography color="information" cursor="pointer" variant="bodyMedium">
                    {t(`${I18N_PATH}AddTruck`)}
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
                {values?.truckCosts?.map((truckCost, index) => {
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
                          name={`truckCosts[${index}].truckId`}
                          placeholder={t(`${I18N_PATH}Select`)}
                          options={getTruckOptions(truckCost.truckId)}
                          error={getIn(errors, `truckCosts[${index}].truckId`)}
                          value={truckCost.truckId}
                          onSelectChange={setFieldValue}
                          nonClearable
                        />
                      </Layouts.Flex>
                      {values.detailedCosts ? (
                        <>
                          <FormInput
                            type="number"
                            placeholder={placeholder}
                            name={`truckCosts[${index}].fuelCost`}
                            inputTextAlign="right"
                            value={truckCost.fuelCost}
                            onChange={handleChange}
                            error={getIn(errors, `truckCosts[${index}].fuelCost`)}
                          />
                          <FormInput
                            type="number"
                            placeholder={placeholder}
                            name={`truckCosts[${index}].miscAverageCost`}
                            inputTextAlign="right"
                            value={truckCost.miscAverageCost}
                            onChange={handleChange}
                            error={getIn(errors, `truckCosts[${index}].miscAverageCost`)}
                          />
                          <FormInput
                            type="number"
                            placeholder={placeholder}
                            name={`truckCosts[${index}].insuranceCost`}
                            inputTextAlign="right"
                            value={truckCost.insuranceCost}
                            onChange={handleChange}
                            error={getIn(errors, `truckCosts[${index}].insuranceCost`)}
                          />
                          <FormInput
                            type="number"
                            placeholder={placeholder}
                            name={`truckCosts[${index}].maintenanceCost`}
                            inputTextAlign="right"
                            value={truckCost.maintenanceCost}
                            onChange={handleChange}
                            error={getIn(errors, `truckCosts[${index}].maintenanceCost`)}
                          />
                          <FormInput
                            type="number"
                            placeholder={placeholder}
                            name={`truckCosts[${index}].depreciationCost`}
                            inputTextAlign="right"
                            value={truckCost.depreciationCost}
                            onChange={handleChange}
                            error={getIn(errors, `truckCosts[${index}].depreciationCost`)}
                          />
                        </>
                      ) : (
                        <Layouts.Cell width={1} left={6} justifySelf="flex-end">
                          <FormInput
                            type="number"
                            placeholder={placeholder}
                            name={`truckCosts[${index}].truckAverageCost`}
                            inputTextAlign="right"
                            value={truckCost.truckAverageCost}
                            onChange={handleChange}
                            error={getIn(errors, `truckCosts[${index}].truckAverageCost`)}
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

export default observer(TruckCosts);
