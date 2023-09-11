import React, { memo, useCallback, useMemo } from 'react';
import { Trans, useTranslation } from '../../../i18n';
import { useField, Field } from 'react-final-form';
import Box from '@material-ui/core/Box';
import { Button } from '@material-ui/core';
import { createStyles, makeStyles } from '@material-ui/core/styles';
import IconButton from '@material-ui/core/IconButton';
import DeleteIcon from '@material-ui/icons/Delete';
import AddIcon from '@material-ui/icons/Add';
import { TextField, SelectOption } from '@starlightpro/common';

import PhoneNumberTextMask from '../../PhoneNumberTextMask';
import { Phone } from '../../../graphql/api';

const useStyles = makeStyles(
  ({ spacing }) =>
    createStyles({
      root: {
        width: '100%',
        marginBottom: spacing(5),
      },
      selectRoot: {
        marginTop: spacing(1),
      },
      fieldSeparator: {
        marginLeft: spacing(2),
      },
      phoneTypeField: {
        minWidth: 100,
      },
      phoneExtensionField: {
        maxWidth: 100,
        minWidth: 100,
      },
      removeButton: {
        alignSelf: 'flex-end',
        marginBottom: 28,
      },
      removePlaceholder: {
        minWidth: 48,
      },
    }),
  {
    name: 'PhonesField',
  },
);

export interface PhonesFieldProps {
  name: string;
  min?: number;
  phoneTypes: string[];
  disabled?: boolean;
  firstNumberType: string;
  firstNumberRemovable?: boolean;
}

export interface PhoneFieldProps {
  index: number;
  phone: Phone;
  classes: any;
  name: string;
  defaultPhoneType: string;
  minimumRequired?: number;
  canRemove?: boolean;
  phoneTypes: string[];
  disabled?: boolean;
  phoneTypeDisabled?: boolean;
}

export const PhoneField = memo<PhoneFieldProps>(
  ({ index, classes, name, phoneTypes, canRemove, disabled, phoneTypeDisabled }) => {
    const [t] = useTranslation();
    const phoneTypeOptions = useMemo(() => {
      return phoneTypes.map((type) => (
        <SelectOption key={type} value={type}>
          <Trans>{'PhoneType-' + type}</Trans>
        </SelectOption>
      ));
    }, [phoneTypes]);

    return (
      <Box display="flex" flexDirection="row">
        <TextField
          select
          label={<Trans>Phone Type</Trans>}
          name={`${name}[${index}].type`}
          id={`${name}[${index}].type`}
          className={classes.phoneTypeField}
          placeholder={t('Select Type')}
          disabled={disabled || phoneTypeDisabled}
        >
          {phoneTypeOptions}
        </TextField>
        <Box className={classes.fieldSeparator} />
        <TextField
          disabled={disabled}
          fullWidth
          required
          name={`${name}[${index}].number`}
          inputProps={{ id: `${name}[${index}].number` }}
          label={<Trans>Phone Number</Trans>}
          placeholder={t('Enter Phone Number')}
          InputProps={{
            inputComponent: PhoneNumberTextMask as any,
          }}
        />
        <Box className={classes.fieldSeparator} />
        <TextField
          disabled={disabled}
          className={classes.phoneExtensionField}
          name={`${name}[${index}].extension`}
          inputProps={{ id: `${name}[${index}].extension` }}
          label={<Trans>Extension</Trans>}
        />
        <Box className={classes.fieldSeparator} />
        {(canRemove && (
          <Field name={name}>
            {({ input }) => {
              const onRemove = () => {
                const newPhones = [...input.value];

                newPhones.splice(index, 1);

                input.onChange({
                  target: {
                    name,
                    value: newPhones,
                  },
                });
              };

              return (
                <IconButton
                  disabled={disabled}
                  className={classes.removeButton}
                  color="secondary"
                  onClick={onRemove}
                  aria-label="Delete"
                >
                  <DeleteIcon />
                </IconButton>
              );
            }}
          </Field>
        )) || <Box className={classes.removePlaceholder}></Box>}
      </Box>
    );
  },
);
PhoneField.displayName = 'PhoneField';

export const PhonesField = memo<PhonesFieldProps>(
  ({ name, phoneTypes, min, disabled, firstNumberType, firstNumberRemovable }) => {
    const classes = useStyles();
    const { input } = useField(name, { subscription: { value: true } });
    const phones: Phone[] = useMemo(() => input.value || [], [input.value]);
    const minimumRequired = min || 0;
    const phoneTypesAvailable = useMemo(() => {
      return phoneTypes.filter((value) => value !== firstNumberType);
    }, [phoneTypes, firstNumberType]);
    const phoneFields = useMemo(() => {
      return phones.map((phone, index) => (
        <PhoneField
          key={index}
          phone={phone}
          index={index}
          name={name}
          phoneTypes={index === 0 ? [firstNumberType] : phoneTypesAvailable}
          classes={classes}
          defaultPhoneType={phoneTypesAvailable[0]}
          canRemove={
            minimumRequired > 0 &&
            phones.length > minimumRequired &&
            firstNumberRemovable &&
            index > 0
          }
          disabled={disabled}
          phoneTypeDisabled={!!firstNumberType && index === 0}
        />
      ));
    }, [
      phones,
      name,
      classes,
      phoneTypesAvailable,
      minimumRequired,
      disabled,
      firstNumberRemovable,
      firstNumberType,
    ]);

    const addMore = useCallback(() => {
      input.onChange({
        target: {
          name,
          value: [
            ...input.value,
            {
              type: phoneTypesAvailable[0],
              number: '',
              extension: '',
            },
          ],
        },
      });
    }, [phoneTypesAvailable, input, name]);

    return (
      <Box display="block" className={classes.root}>
        <Box display="flex" flexDirection="column">
          {phoneFields}
        </Box>
        {phones.length < 5 && (
          <Button disabled={disabled} onClick={addMore} color="primary">
            <AddIcon />
            &nbsp;<Trans>Add Another Phone Number</Trans>
          </Button>
        )}
      </Box>
    );
  },
);
