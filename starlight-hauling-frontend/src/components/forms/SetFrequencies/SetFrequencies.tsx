import React, { useCallback, useMemo } from 'react';
import { Button, Layouts } from '@starlightpro/shared-components';
import { FieldArray, getIn, useFormik } from 'formik';
import { intersection, isEmpty, isEqual, noop } from 'lodash-es';

import { FormInput, RadioButton, Typography } from '@root/common';
import { Divider } from '@root/common/TableTools';
import { frequencyConstraintsByCycles } from '@root/consts';
import globalStyles from '@root/css/base.scss';
import { Frequency } from '@root/pages/SystemConfiguration/components/Frequency/Frequency';
import { type IFrequency } from '@root/types';
import { type FrequencyType } from '@root/types/entities/frequency';

import { FormContainerLayout } from '../layout/FormContainer';

import { getValues, validationSchema } from './formikData';
import { type ISetFrequenciesForm } from './types';

const SetFrequenciesForm: React.FC<ISetFrequenciesForm> = ({
  billingCycles,
  frequencies,
  onSubmit,
  onClose,
}) => {
  const initialValues = useMemo(() => getValues(frequencies), [frequencies]);

  const formik = useFormik({
    initialValues,
    validationSchema,
    validateOnChange: false,
    onSubmit: noop,
    onReset: onClose,
  });

  const { values, errors, validateForm, setFormikState, handleChange, setErrors } = formik;

  const handleFrequencyTypeChange = useCallback(
    (type: FrequencyType) => {
      setFormikState(state => ({
        ...state,
        errors: {},
        values: {
          ...state.values,
          type,
          everyXDaysTimes: undefined,
          xPerWeekTimes: undefined,
        },
      }));
    },
    [setFormikState],
  );

  // TODO: there are consistent ids for those types and times, create mapper for this matter
  const handleAddFrequency = useCallback(
    async (push: (data: Omit<IFrequency, 'id' | 'createdAt' | 'updatedAt'>) => void) => {
      const error = await validateForm();

      if (!isEmpty(error)) {
        return;
      }

      const newFrequency = {
        id: '',
        type: values.type,
        times: getIn(values, `${values.type}Times`),
      };

      if (
        !values.frequencies.some(frequency => {
          return isEqual(frequency, newFrequency);
        })
      ) {
        push(newFrequency);
      } else {
        setErrors({
          [`${values.type}Times`]: 'Frequency is already added',
        });
      }
    },
    [setErrors, validateForm, values],
  );

  const saveFrequencies = useCallback(() => {
    onSubmit(values.frequencies);
    onClose();
  }, [onSubmit, values.frequencies, onClose]);

  const shouldShowFrequency = useCallback(
    (frequencyType: FrequencyType) =>
      intersection(frequencyConstraintsByCycles[frequencyType], billingCycles).length,
    [billingCycles],
  );

  return (
    <FormContainerLayout formik={formik}>
      <Layouts.Flex direction="column" justifyContent="space-between">
        <Layouts.Padding top="3" right="5" left="5">
          <Typography variant="headerThree">Edit Frequencies</Typography>
        </Layouts.Padding>
        <Layouts.Flex role="group" aria-labelledby="addFrequency" direction="column" flexGrow={1}>
          <Layouts.Padding padding="5" bottom="2" top="2">
            <Layouts.Margin bottom="1">
              <Typography id="addFrequency" variant="bodyMedium" color="secondary" shade="light">
                Add Frequency
              </Typography>
            </Layouts.Margin>
            <FieldArray name="frequencies">
              {({ push, remove }) => (
                <>
                  <Layouts.Box backgroundColor="grey" backgroundShade="desaturated">
                    <Layouts.Padding padding="2" top="1" bottom="1">
                      <Layouts.Flex justifyContent="space-between" alignItems="center">
                        <Layouts.Flex direction="column">
                          {shouldShowFrequency('xPerWeek') ? (
                            <Layouts.Margin bottom="1">
                              <Layouts.Flex alignItems="center">
                                <RadioButton
                                  id="xPerWeek"
                                  name="type"
                                  onChange={() => handleFrequencyTypeChange('xPerWeek')}
                                  value={values.type == 'xPerWeek'}
                                >
                                  <span className={globalStyles.visuallyHidden}>
                                    Times per week
                                  </span>
                                </RadioButton>
                                <Layouts.Margin left="1" right="1">
                                  <Layouts.Box width="50px">
                                    <FormInput
                                      name="xPerWeekTimes"
                                      ariaLabel="Times per week"
                                      type="number"
                                      noError
                                      onFocus={() => handleFrequencyTypeChange('xPerWeek')}
                                      onChange={handleChange}
                                      placeholder="X"
                                      value={values.xPerWeekTimes}
                                    />
                                  </Layouts.Box>
                                </Layouts.Margin>
                                <Typography
                                  variant="bodyMedium"
                                  color="secondary"
                                  shade="light"
                                  cursor="pointer"
                                >
                                  per week
                                </Typography>
                              </Layouts.Flex>
                            </Layouts.Margin>
                          ) : null}
                          {shouldShowFrequency('everyXDays') ? (
                            <Layouts.Margin bottom="1">
                              <Layouts.Flex alignItems="center">
                                <RadioButton
                                  id="everyXDays"
                                  name="type"
                                  onChange={() => handleFrequencyTypeChange('everyXDays')}
                                  value={values.type == 'everyXDays'}
                                >
                                  <Typography variant="bodyMedium" color="secondary" shade="light">
                                    Every
                                  </Typography>
                                </RadioButton>
                                <Layouts.Margin left="1" right="1">
                                  <Layouts.Box width="50px">
                                    <FormInput
                                      name="everyXDaysTimes"
                                      ariaLabel="Once every X days"
                                      type="number"
                                      noError
                                      onChange={handleChange}
                                      onFocus={() => handleFrequencyTypeChange('everyXDays')}
                                      placeholder="X"
                                      value={values.everyXDaysTimes}
                                    />
                                  </Layouts.Box>
                                </Layouts.Margin>
                                <Typography
                                  variant="bodyMedium"
                                  color="secondary"
                                  shade="light"
                                  cursor="pointer"
                                >
                                  days
                                </Typography>
                              </Layouts.Flex>
                            </Layouts.Margin>
                          ) : null}
                          {shouldShowFrequency('xPerMonth') ? (
                            <Layouts.Flex alignItems="center">
                              <Layouts.Margin bottom="1">
                                <RadioButton
                                  id="xPerMonth"
                                  name="type"
                                  onChange={() => handleFrequencyTypeChange('xPerMonth')}
                                  value={values.type == 'xPerMonth'}
                                >
                                  <Typography variant="bodyMedium" color="secondary" shade="light">
                                    Monthly
                                  </Typography>
                                </RadioButton>
                              </Layouts.Margin>
                            </Layouts.Flex>
                          ) : null}
                          {shouldShowFrequency('onCall') ? (
                            <Layouts.Flex alignItems="center">
                              <Layouts.Margin bottom="1">
                                <RadioButton
                                  id="onCall"
                                  name="type"
                                  onChange={() => handleFrequencyTypeChange('onCall')}
                                  value={values.type == 'onCall'}
                                >
                                  <Typography variant="bodyMedium" color="secondary" shade="light">
                                    On call
                                  </Typography>
                                </RadioButton>
                              </Layouts.Margin>
                            </Layouts.Flex>
                          ) : null}
                        </Layouts.Flex>
                        <Typography
                          color="primary"
                          variant="headerTwo"
                          cursor="pointer"
                          onClick={() => handleAddFrequency(push)}
                        >
                          +
                        </Typography>
                      </Layouts.Flex>
                      <Typography color="alert" variant="bodySmall">
                        {errors.xPerMonthTimes ??
                          errors.xPerWeekTimes ??
                          errors.everyXDaysTimes ??
                          errors.onCallTimes}
                      </Typography>
                    </Layouts.Padding>
                  </Layouts.Box>

                  <Layouts.Padding bottom="1" top="1">
                    <Typography variant="bodyMedium" color="secondary" shade="light">
                      Current Frequencies
                    </Typography>
                  </Layouts.Padding>
                  <Divider />
                  <Layouts.Scroll height={200}>
                    {values.frequencies.length ? (
                      values.frequencies.map((frequency, index) => (
                        <React.Fragment key={index}>
                          <Layouts.Padding top="1" bottom="1">
                            <Frequency
                              type={frequency.type}
                              times={frequency.times}
                              onRemoveClick={() => remove(index)}
                            />
                          </Layouts.Padding>
                          <Divider />
                        </React.Fragment>
                      ))
                    ) : (
                      <Layouts.Flex direction="column" alignItems="center">
                        <Layouts.Box top="100px" position="relative">
                          <Typography variant="bodyMedium" color="secondary" shade="desaturated">
                            No frequencies added
                          </Typography>
                        </Layouts.Box>
                      </Layouts.Flex>
                    )}
                  </Layouts.Scroll>
                </>
              )}
            </FieldArray>
          </Layouts.Padding>
        </Layouts.Flex>
        <Divider />
        <Layouts.Padding padding="4" left="5" right="5">
          <Layouts.Flex justifyContent="space-between">
            <Button type="reset">Cancel</Button>
            <Button
              type="submit"
              variant="primary"
              disabled={!values.frequencies.length}
              onClick={saveFrequencies}
            >
              Save Changes
            </Button>
          </Layouts.Flex>
        </Layouts.Padding>
      </Layouts.Flex>
    </FormContainerLayout>
  );
};

export default SetFrequenciesForm;
