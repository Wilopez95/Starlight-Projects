import React, { useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router';
import { Checkbox, Layouts, Select, ValidationMessageBlock } from '@starlightpro/shared-components';
import cx from 'classnames';
import { getIn, useFormikContext } from 'formik';
import { observer } from 'mobx-react-lite';

import { Typography } from '@root/common';
import {
  BillingCycleEnum,
  billingCyclesOptions,
  BillingTypeEnum,
  billingTypesOptions,
  BusinessLineType,
  Routes,
} from '@root/consts';
import { useStores } from '@root/hooks';
import { BusinessUnitType, IBusinessLine, IBusinessUnit } from '@root/types';

import styles from './css/styles.scss';

const I18N_PATH = 'pages.SystemConfiguration.tables.BusinessUnit.sections.BusinessLines.Text.';

const Section: React.FC = () => {
  const { t } = useTranslation();
  const {
    values: { businessLines, ...values },
    errors,
    setValues,
    setFieldValue,
    isSubmitting,
  } = useFormikContext<IBusinessUnit>();
  const { businessUnitStore, businessLineStore } = useStores();
  const { id: businessUnitId } = useParams<{ id: string }>();
  const businessUnit = businessUnitStore.getById(businessUnitId);
  const lines = businessLineStore.sortedValues;

  const isNew = businessUnitId === Routes.Create;

  useEffect(() => {
    if (!lines.length) {
      businessLineStore.request();
    }
  }, [businessLineStore, lines.length]);

  const messageVisible =
    businessUnit?.areBusinessLinesChanged(businessLines) || (isNew && businessLines.length);
  const businessUnitLines = businessUnit?.businessLines;
  const activatedLinesIds = businessUnitLines?.map(item => item.id);

  const handleChange = useCallback(
    (businessLine: IBusinessLine) => {
      if (isSubmitting) {
        return;
      }

      if (!businessLines.find(({ id }) => id === businessLine.id)) {
        setValues({
          ...values,
          businessLines: [...businessLines, businessLine],
        });
      } else if (!businessUnitLines?.find(({ id }) => id === businessLine.id)) {
        // allow to disable selection when data is not saved yet
        setValues({
          ...values,
          businessLines: businessLines.filter(({ id }) => id !== businessLine.id),
        });
      }
    },
    [businessLines, isSubmitting, businessUnitLines, setValues, values],
  );

  const handleFacilityLoBChange = useCallback(
    (_, businessLineId: number) => {
      const businessLine = lines.find(({ id }) => id === businessLineId);

      if (businessLine) {
        setValues({
          ...values,
          businessLines: [
            {
              ...businessLine,
              billingCycle: BillingCycleEnum.daily,
              billingType: BillingTypeEnum.arrears,
            },
          ],
        });
      }
    },
    [lines, setValues, values],
  );

  return (
    <div className={styles.section}>
      <div role="group" aria-labelledby="linesOfBusinessHeader" className={styles.content}>
        <Typography id="linesOfBusinessHeader" variant="headerThree" className={styles.spaceBottom}>
          {t(`${I18N_PATH}LinesOfBusiness`)}
        </Typography>
        {values.type === BusinessUnitType.RECYCLING_FACILITY ? (
          <Layouts.Flex alignItems="baseline">
            <Typography variant="bodyMedium" color="secondary" shade="desaturated">
              {t(`${I18N_PATH}LinesOfBusiness`)}
            </Typography>
            <Layouts.Margin left="5">
              <Layouts.Box width="400px">
                <Select
                  name="businessLines[0].id"
                  disabled={!isNew}
                  nonClearable
                  options={lines
                    .filter(line => line.active && line.type === BusinessLineType.recycling)
                    .map(line => ({ label: line.name, value: line.id }))}
                  value={businessLines[0]?.id}
                  error={getIn(errors, `businessLines[0].id`)}
                  onSelectChange={handleFacilityLoBChange}
                />
              </Layouts.Box>
            </Layouts.Margin>
          </Layouts.Flex>
        ) : (
          <div className={styles.businessLineList}>
            <Layouts.Box width="100%">
              <Layouts.Flex direction="column">
                {lines
                  .filter(line => line.active)
                  .filter(line => line.type !== BusinessLineType.recycling)
                  .map((line, index) => {
                    // todo: move render lines to separate component
                    const isChecked = !!businessLines.find(item => item.id === line.id);
                    const isDisabled = activatedLinesIds?.includes(line.id);

                    const idx = businessLines.findIndex(item => item.id === line.id);
                    const isFirstItem = index === 0;

                    return (
                      <Layouts.Margin right="4" key={line.id}>
                        <Layouts.Flex>
                          <Layouts.Margin top={isFirstItem ? '4' : '1'}>
                            <Checkbox
                              disabled={isDisabled}
                              key={line.id}
                              onChange={() => handleChange(line)}
                              name="businessLines"
                              title={line.name}
                              value={isChecked}
                              labelClass={styles.businessLine}
                            >
                              {line.name}
                            </Checkbox>
                          </Layouts.Margin>
                          <Layouts.Flex as={Layouts.Box} width="100%" justifyContent="space-evenly">
                            <Layouts.Box width="300px">
                              <Select
                                label={isFirstItem ? t(`${I18N_PATH}BillingType`) : ''}
                                name={`businessLines[${idx}].billingType`}
                                disabled={(isNew && !isChecked) || !isChecked}
                                options={billingTypesOptions}
                                value={businessLines[idx]?.billingType ?? undefined}
                                error={getIn(errors, `businessLines[${idx}].billingType`)}
                                onSelectChange={setFieldValue}
                              />
                            </Layouts.Box>
                            <Layouts.Box width="300px">
                              <Select
                                label={isFirstItem ? t(`${I18N_PATH}BillingCycle`) : ''}
                                name={`businessLines[${idx}].billingCycle`}
                                disabled={(isNew && !isChecked) || !isChecked}
                                options={billingCyclesOptions}
                                value={businessLines[idx]?.billingCycle ?? undefined}
                                error={getIn(errors, `businessLines[${idx}].billingCycle`)}
                                onSelectChange={setFieldValue}
                              />
                            </Layouts.Box>
                          </Layouts.Flex>
                        </Layouts.Flex>
                      </Layouts.Margin>
                    );
                  })}
              </Layouts.Flex>
            </Layouts.Box>
          </div>
        )}
        {typeof errors.businessLines === 'string' ? (
          <div
            data-error={errors.businessLines}
            className={cx(styles.linesError, { [styles.visible]: !!errors.businessLines })}
          >
            <Typography color="alert" variant="bodySmall">
              {errors.businessLines}
            </Typography>
          </div>
        ) : null}
        {messageVisible ? (
          <ValidationMessageBlock color="primary" shade="desaturated" textColor="secondary">
            {t(`${I18N_PATH}AfterSavingBusinessUnit`)}
          </ValidationMessageBlock>
        ) : null}
      </div>
    </div>
  );
};

export default observer(Section);
