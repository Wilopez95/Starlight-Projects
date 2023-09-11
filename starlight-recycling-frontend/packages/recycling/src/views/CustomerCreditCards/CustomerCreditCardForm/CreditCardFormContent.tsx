import React, { FC, useCallback } from 'react';
import { RadioGroupField, RadioGroupItem, SelectOption, TextField } from '@starlightpro/common';
import { Field, useForm, useFormState } from 'react-final-form';
import { Trans, useTranslation } from '../../../i18n';
import cs from 'classnames';
import moment from 'moment';

import { makeStyles, Theme } from '@material-ui/core/styles';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import Box from '@material-ui/core/Box';
import Divider from '@material-ui/core/Divider';
import Typography from '@material-ui/core/Typography';
import IconButton from '@material-ui/core/IconButton';
import DeleteIcon from '@material-ui/icons/Delete';

import TabPanel from '../../../components/TabPanel/TabPanel';
import CardNumberTextMask from '../../../components/CardNumberTextMask/CardNumberTextMask';
import CustomerJobSiteSearchField from './CustomerJobSiteSearchField';
import { CustomerJobSiteOption } from '../../YardOperationConsole/Inputs/JobSiteInput';
import { validate } from '../../../utils/forms';
import { CreditCardSchema } from './schema';
import Button from '@material-ui/core/Button';
import { CustomerType } from '../../../graphql/api';

const useStyles = makeStyles((theme: Theme) => ({
  fieldContainer: {
    width: 280,
  },
  stateField: {
    marginRight: theme.spacing(4),
  },
  expireMonth: {
    width: 150,
  },
  expireYear: {
    width: 90,
  },
  divider: {
    opacity: '30%',
  },
  cvv: {
    width: 85,
  },
  radioGroup: {
    marginTop: -theme.spacing(3 / 4),
  },
  hidden: {
    display: 'none',
  },
  deleteIcon: {
    marginRight: theme.spacing(1),
  },
  field: {
    marginBottom: theme.spacing(3),
  },
  radioGroupRoot: {
    alignItems: 'flex-start',
  },
  radioGroupFieldLabel: {
    marginTop: theme.spacing(0.75),
    marginRight: theme.spacing(2),
  },
  radioGroupFormControl: {
    display: 'flex',
    flexDirection: 'column',
  },
  bottomActions: {
    display: 'flex',
    justifyContent: 'space-between',
    marginTop: theme.spacing(3),
  },
  tabContent: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
  },
  tabPanel: {
    height: '100%',
  },
  fullHeightBox: {
    flexGrow: 1,
  },
  cardMainInfo: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    paddingTop: theme.spacing(3),
    paddingBottom: theme.spacing(3),
  },
  hiddenLabel: {
    margin: '-1px',
    overflow: 'hidden',
    padding: 0,
    position: 'absolute',
    width: '1px',
  },
}));

const months = moment.months().map((month) => (
  <SelectOption key={month} value={month}>
    {month}
  </SelectOption>
));

function getFutureYearsOptions() {
  const startYear = moment();

  return new Array(10).fill(null).map(() => {
    const year = startYear.format('YYYY');
    startYear.add(1, 'year');

    return (
      <SelectOption key={year} value={year}>
        {year}
      </SelectOption>
    );
  });
}
const futureYears = getFutureYearsOptions();

export interface CreditCardFormContentProps {
  customerId: number;
  disabled?: boolean;
  create?: boolean;
  onCancel?: () => void;
}

export const CreditCardFormContent: FC<CreditCardFormContentProps> = ({
  customerId,
  disabled,
  create,
  onCancel,
}) => {
  const classes = useStyles();
  const [t] = useTranslation();
  const form = useForm();
  const state = useFormState({
    subscription: { values: true, submitting: true },
  });
  const { activeTab, customerType } = state.values;
  const isWalkup = customerType === CustomerType.Walkup;

  const changeTab = useCallback(
    async (tab: number) => {
      form.submit();
      const invalid = await validate(state.values, CreditCardSchema);

      if (invalid) {
        return;
      }
      form.change('activeTab', tab);
    },
    [form, state.values],
  );

  return (
    <>
      <Tabs
        value={activeTab}
        onChange={(e, tab) => changeTab(tab)}
        aria-label="tabs"
        indicatorColor="primary"
      >
        <Tab label={t('Card Information')} id="card-info" tabIndex={0} />
        {!isWalkup && <Tab label={t('Assign to Job Site')} id="assign-to-job-site" tabIndex={0} />}
      </Tabs>
      <TabPanel
        alwaysRendered
        index={0}
        value={activeTab}
        aria-labelledby="card-info"
        className={classes.tabPanel}
      >
        <Box className={classes.tabContent}>
          <Box className={cs(classes.cardMainInfo, classes.fullHeightBox)}>
            <Box display="flex" justifyContent="space-between">
              <Box className={classes.fieldContainer}>
                <TextField
                  id="cardNickname"
                  disabled={disabled}
                  fullWidth
                  name="cardNickname"
                  label={<Trans>Card Nickname</Trans>}
                  className={classes.field}
                />
              </Box>
            </Box>
            <Divider />
            <Box display="flex" justifyContent="space-between" pt={3}>
              <Box className={classes.fieldContainer}>
                <TextField
                  fullWidth
                  id="addressLine1"
                  name="addressLine1"
                  label={<Trans>Address Line 1</Trans>}
                  aria-required
                  required
                  disabled={disabled}
                  className={classes.field}
                />
              </Box>
              <Box className={classes.fieldContainer}>
                <TextField
                  fullWidth
                  id="addressLine2"
                  name="addressLine2"
                  label={<Trans>Address Line 2</Trans>}
                  disabled={disabled}
                  className={classes.field}
                />
              </Box>
            </Box>
            <Box display="flex" justifyContent="space-between">
              <Box className={classes.fieldContainer}>
                <TextField
                  fullWidth
                  id="city"
                  name="city"
                  label={<Trans>City</Trans>}
                  required
                  aria-required
                  disabled={disabled}
                  className={classes.field}
                />
              </Box>
              <Box display="flex" className={classes.fieldContainer}>
                <TextField
                  fullWidth
                  id="state"
                  name="state"
                  label={<Trans>State</Trans>}
                  required
                  aria-required
                  className={cs(classes.stateField, classes.field)}
                  disabled={disabled}
                />
                <TextField
                  fullWidth
                  id="zip"
                  name="zip"
                  label={<Trans>ZIP</Trans>}
                  required
                  aria-required
                  disabled={disabled}
                  className={classes.field}
                />
              </Box>
            </Box>
            <Box display="flex" justifyContent="space-between">
              <Box className={classes.fieldContainer}>
                <TextField
                  fullWidth
                  id="nameOnCard"
                  name="nameOnCard"
                  label={<Trans>Name on Card</Trans>}
                  required
                  aria-required
                  disabled={disabled}
                  className={classes.field}
                />
              </Box>
              <Box display="flex" alignItems="flex-end" className={classes.fieldContainer}>
                <TextField
                  select
                  id="expireMonth"
                  name="expireMonth"
                  label={<Trans>Expiration Date</Trans>}
                  required
                  aria-required
                  className={cs(classes.expireMonth, classes.field)}
                  fullWidth
                  disabled={disabled}
                  SelectProps={{
                    inputProps: {
                      id: 'expireMonth',
                    },
                  }}
                >
                  {months}
                </TextField>
                <Box flex="1" alignSelf="center">
                  <Typography className={classes.divider} color="textPrimary" align="center">
                    /
                  </Typography>
                </Box>
                <TextField
                  disabled={disabled}
                  className={cs(classes.expireYear, classes.field)}
                  classes={{ labelRoot: classes.hiddenLabel }}
                  fullWidth
                  id="expireYear"
                  select
                  name="expireYear"
                  required
                  aria-required
                  label={t('Expiration year')}
                >
                  {futureYears}
                </TextField>
              </Box>
            </Box>
            <Box display="flex" justifyContent="space-between">
              <Box className={classes.fieldContainer}>
                {create ? (
                  <TextField
                    fullWidth
                    id="cardNumber"
                    name="cardNumber"
                    label={<Trans>Card Number</Trans>}
                    required
                    aria-required
                    InputProps={{
                      inputComponent: CardNumberTextMask as any,
                    }}
                    disabled={disabled}
                    className={classes.field}
                  />
                ) : (
                  <TextField
                    fullWidth
                    id="cardNumberLastDigits"
                    name="cardNumberLastDigits"
                    label={<Trans>Card Number</Trans>}
                    disabled
                    className={classes.field}
                  />
                )}
              </Box>
              <Box className={classes.fieldContainer}>
                <TextField
                  className={cs(classes.cvv, classes.field)}
                  id="cvv"
                  name="cvv"
                  label={<Trans>CVV</Trans>}
                  placeholder="•••"
                  required={create}
                  disabled={!create}
                />
              </Box>
            </Box>
          </Box>
          <Box>
            <Divider />
            <Box className={classes.bottomActions}>
              <Button color="primary" variant="outlined" onClick={onCancel}>
                <Trans>Cancel</Trans>
              </Button>
              {isWalkup ? (
                <Button
                  color="primary"
                  variant="outlined"
                  disabled={state.submitting}
                  onClick={() => {
                    form.change('preventSubmit', false);
                    form.submit();
                  }}
                >
                  <Trans>Add New Card</Trans>
                </Button>
              ) : (
                <Button color="primary" variant="outlined" onClick={() => changeTab(1)}>
                  <Trans>Assign to Job Site →</Trans>
                </Button>
              )}
            </Box>
          </Box>
        </Box>
      </TabPanel>
      {!isWalkup && (
        <TabPanel
          alwaysRendered
          index={1}
          value={activeTab}
          aria-labelledby="assign-to-job-site"
          className={classes.tabPanel}
        >
          <Box className={classes.tabContent}>
            <Box className={classes.fullHeightBox}>
              <Box display="flex" alignItems="baseline" pt={3}>
                <Box flex="1">
                  <RadioGroupField
                    aria-labelledby="card-is-valid-for"
                    name="isValidFor"
                    classes={{
                      root: classes.radioGroup,
                      groupRoot: classes.radioGroupRoot,
                      fieldLabelFormControl: classes.radioGroupFieldLabel,
                      formControl: classes.radioGroupFormControl,
                    }}
                    label={
                      <Typography color="textSecondary" variant="body2">
                        <Trans>Card is valid for</Trans>
                      </Typography>
                    }
                  >
                    <RadioGroupItem
                      color="primary"
                      label={t('All Job Sites')}
                      value="all"
                      disabled={disabled}
                      tabIndex={0}
                    />
                    <RadioGroupItem
                      disabled={disabled}
                      color="primary"
                      label={t('Specific Job Site only')}
                      value="specific"
                      tabIndex={0}
                    />
                  </RadioGroupField>
                </Box>
              </Box>
              <Divider />
              <Field name="selectedJobSites" subscription={{ value: true }}>
                {({ input: { value: selectedJobSites, onChange } }) =>
                  selectedJobSites.map((jobSite: CustomerJobSiteOption['jobSite']) => (
                    <Box key={jobSite.id} display="flex" alignItems="center" mt={1} mb={1}>
                      <IconButton
                        disabled={disabled}
                        size="small"
                        className={classes.deleteIcon}
                        onClick={() => {
                          onChange({
                            target: {
                              name: 'selectedJobSites',
                              value: selectedJobSites.filter(
                                (selectedJobSite: CustomerJobSiteOption['jobSite']) =>
                                  jobSite.id !== selectedJobSite.id,
                              ),
                            },
                          });
                        }}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                      <Typography variant="body2" color="textSecondary">
                        {jobSite.fullAddress}
                      </Typography>
                    </Box>
                  ))
                }
              </Field>
              <Field name="isValidFor" subscription={{ value: true }}>
                {({ input: { value: isValidFor } }) => (
                  <Box pt={3} className={cs({ [classes.hidden]: isValidFor === 'all' })}>
                    <CustomerJobSiteSearchField
                      disabled={disabled}
                      name="selectedJobSite"
                      label={t('Job Site')}
                      customerId={customerId}
                    />
                  </Box>
                )}
              </Field>
            </Box>
            <Box>
              <Divider />
              <Box className={classes.bottomActions}>
                <Button
                  color="primary"
                  variant="outlined"
                  onClick={() => {
                    form.change('activeTab', 0);
                    form.change('preventSubmit', true);
                  }}
                >
                  <Trans>← Back</Trans>
                </Button>
                <Button
                  color="primary"
                  variant="outlined"
                  disabled={state.submitting}
                  onClick={() => {
                    form.change('preventSubmit', false);
                    form.submit();
                  }}
                >
                  <Trans>Add New Card</Trans>
                </Button>
              </Box>
            </Box>
          </Box>
        </TabPanel>
      )}
    </>
  );
};

export default CreditCardFormContent;
