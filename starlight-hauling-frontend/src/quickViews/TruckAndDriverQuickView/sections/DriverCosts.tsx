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
import { IDriverCost, ITruckAndDriverCost } from '@root/types';

import { defaultDriverCost } from '../formikData';

import styles from '../css/styles.scss';

const I18N_PATH = 'pages.SystemConfiguration.tables.TrucksAndDriversCosts.QuickView.Text.';

const DriverCosts: React.FC = () => {
  const { driverStore } = useStores();
  const { t } = useTranslation();
  const formik = useFormikContext<ITruckAndDriverCost>();
  const [isOpen, toggleOpen] = useToggle();
  const { formatCurrency } = useIntl();

  const { values, errors, handleChange, setFieldValue } = formik;

  const placeholder = formatCurrency(0);

  const driversOptions: ISelectOption[] = driverStore.values
    .filter(el => !values.driverCosts?.find(cost => cost?.driverId === +el.id))
    .map(elem => ({
      value: elem.id,
      label: [elem.truck?.description, elem.description].join(' / '),
    }));

  const getDriverOptions = (id?: number) => {
    const driverCurrent = driverStore.values.find(value => value.id === id);

    if (!driverCurrent) {
      return driversOptions;
    }

    return [
      {
        value: driverCurrent.id,
        label: [driverCurrent.truck?.description, driverCurrent.description].join(' / '),
      },
      ...driversOptions,
    ];
  };

  const handleAddNewDriverCost = useCallback(
    (e: React.MouseEvent<HTMLButtonElement, MouseEvent>, push: (data: IDriverCost) => void) => {
      e.stopPropagation();
      if (!isOpen) {
        toggleOpen();
      }
      push(defaultDriverCost);
    },
    [isOpen, toggleOpen],
  );

  return (
    <FieldArray name="driverCosts">
      {({ push, remove }) => (
        <Accordion
          isOpen={isOpen || !isEmpty(errors.driverCosts)}
          toggleOpen={toggleOpen}
          label={t(`${I18N_PATH}Drivers`)}
          actionButton={
            <Layouts.Margin left="auto" right="1">
              <Button
                variant="none"
                disabled={!driversOptions.length}
                onClick={e => handleAddNewDriverCost(e, push)}
              >
                <Layouts.Flex alignItems="center" justifyContent="center">
                  <Layouts.IconLayout height="12px" width="12px">
                    <PlusIcon />
                  </Layouts.IconLayout>
                  <Typography color="information" cursor="pointer" variant="bodyMedium">
                    {t(`${I18N_PATH}AddDriver`)}
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
                {values?.driverCosts?.map((driverCost, index) => {
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
                          name={`driverCosts[${index}].driverId`}
                          placeholder={t(`${I18N_PATH}Select`)}
                          options={getDriverOptions(driverCost.driverId)}
                          error={getIn(errors, `driverCosts[${index}].driverId`)}
                          value={driverCost.driverId}
                          onSelectChange={setFieldValue}
                          nonClearable
                        />
                      </Layouts.Flex>
                      <Layouts.Cell width={1} left={6} justifySelf="flex-end">
                        <FormInput
                          type="number"
                          placeholder={placeholder}
                          name={`driverCosts[${index}].driverAverageCost`}
                          inputTextAlign="right"
                          value={driverCost.driverAverageCost}
                          onChange={handleChange}
                          error={getIn(errors, `driverCosts[${index}].driverAverageCost`)}
                        />
                      </Layouts.Cell>
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

export default observer(DriverCosts);
