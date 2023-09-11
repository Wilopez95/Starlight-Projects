import React, { ChangeEvent, FC, useCallback, useMemo, useRef, useState } from 'react';
import { TextField } from '@starlightpro/common';
import cs from 'classnames';
import { Field, useField } from 'react-final-form';
import { useTranslation } from '../../../../i18n';
import TextFieldComponent from '@starlightpro/common/components/TextField';
import { debounce, uniqBy } from 'lodash-es';
import { makeStyles, Theme } from '@material-ui/core/styles';
import Switch from '@material-ui/core/Switch';

import Datatable from '../../../../components/Datatable/Datatable';
import AttachFileButton from './AttachFileButton';
import { TaxExemptionFormInput } from '../NewCustomerView';
import { validate } from '../../../../utils/forms';
import { TaxExemptionRow } from './schema';

const useStyles = makeStyles((theme: Theme) => ({
  textFieldRoot: {
    marginBottom: 0,
  },

  statusColHeader: {
    paddingLeft: theme.spacing(3),
  },
  allTaxDistrictsRow: {
    height: 100,
    borderBottom: `1px solid ${theme.palette.grey[200]}`,
  },
}));

export interface TaxExemptionFormContentProps {}

export const TaxExemptionFormContent: FC<TaxExemptionFormContentProps> = () => {
  const classes = useStyles();
  const [t] = useTranslation();
  const {
    input: { value: taxExemptions, onChange, name },
  } = useField<TaxExemptionFormInput[]>('taxExemptions', { subscription: { value: true } });
  const inputs = useRef<{ [key: number]: HTMLInputElement }>({});
  const applyToAllFields = useCallback<(prop: string, value: any) => void>(
    (prop, value) => {
      if (taxExemptions.length === 0) {
        return;
      }

      onChange({
        target: {
          name,
          value: taxExemptions.map((exemption) => ({ ...exemption, [prop]: value })),
        },
      });
    },
    [name, onChange, taxExemptions],
  );
  const [authError, setAuthError] = useState<string>('');

  const allChecked = useMemo(
    () => taxExemptions.length > 0 && taxExemptions.every((exemption) => exemption.selected),
    [taxExemptions],
  );
  const applyAllChecked = useCallback<(value: boolean) => void>(
    (value) => {
      applyToAllFields('selected', value);
    },
    [applyToAllFields],
  );

  const fileUrl = useMemo(() => {
    const uniques = uniqBy(taxExemptions, 'fileUrl');

    if (uniques.length === 1) {
      return uniques[0].fileUrl || '';
    }

    return '';
  }, [taxExemptions]);
  const applyFileToAllFields = useCallback<(value: string) => void>(
    (value) => {
      applyToAllFields('fileUrl', value);
    },
    [applyToAllFields],
  );
  const auth = useMemo<string>(() => {
    const uniques = uniqBy(taxExemptions, 'auth');

    if (uniques.length === 1) {
      return uniques[0].auth;
    }

    return '';
  }, [taxExemptions]);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const applyAuthToAllFields = useCallback<(value: string) => void>(
    debounce((value) => {
      applyToAllFields('auth', value);
      validateAuth(value);
    }, 200),
    [applyToAllFields, allChecked],
  );

  const validateAuth = async (value: string) => {
    const result = await validate(
      { auth: value || undefined, selected: allChecked },
      TaxExemptionRow,
    );

    if (result) {
      setAuthError(result.auth);
    } else {
      setAuthError('');
    }
  };

  const data = useMemo(() => [{}, ...taxExemptions], [taxExemptions]);

  return (
    <Datatable
      title=""
      columns={[
        {
          name: 'selected',
          label: t('Status'),
          options: {
            sort: false,
            setCellHeaderProps: () => ({
              className: classes.statusColHeader,
            }),
            customBodyRenderLite: (dataIndex) =>
              dataIndex === 0 ? (
                <Switch
                  color="primary"
                  checked={allChecked}
                  onChange={(e, checked) => {
                    applyAllChecked(checked);
                  }}
                  disabled={data.length < 2}
                />
              ) : (
                <Field type="checkbox" name={`taxExemptions[${dataIndex - 1}].selected`}>
                  {({ input }) => <Switch color="primary" {...input} />}
                </Field>
              ),
          },
        },
        {
          name: 'description',
          label: t('Tax District'),
          options: {
            sort: false,
            customBodyRenderLite: (dataIndex) =>
              dataIndex === 0 ? (
                t('All Tax Districts')
              ) : (
                <Field
                  name={`taxExemptions[${dataIndex - 1}].description`}
                  subscription={{ value: true }}
                >
                  {({ input: { value } }) => value}
                </Field>
              ),
          },
        },
        {
          name: 'fileUrl',
          label: t('File'),
          options: {
            customBodyRenderLite: (dataIndex) =>
              dataIndex === 0 ? (
                <AttachFileButton
                  ref={(el: HTMLInputElement) => (inputs.current[dataIndex] = el)}
                  value={fileUrl}
                  group
                  onChange={(value) => {
                    applyFileToAllFields(value);
                  }}
                  onAttachFileClick={() => {
                    inputs.current[dataIndex].click();
                  }}
                  onDeleteClick={() => {
                    applyFileToAllFields('');
                  }}
                  isActive={allChecked && data.length > 1}
                />
              ) : (
                <Field
                  name={`taxExemptions[${dataIndex - 1}].selected`}
                  subscription={{ value: true }}
                >
                  {({ input: { value: isActive } }) => (
                    <Field
                      name={`taxExemptions[${dataIndex - 1}].fileUrl`}
                      subscription={{ value: true }}
                    >
                      {({ input }) => (
                        <AttachFileButton
                          ref={(el: HTMLInputElement) => (inputs.current[dataIndex] = el)}
                          value={input.value}
                          onChange={input.onChange}
                          onAttachFileClick={() => {
                            inputs.current[dataIndex].click();
                          }}
                          onDeleteClick={() => {
                            input.onChange({
                              target: {
                                name: input.name,
                                value: '',
                              },
                            });
                          }}
                          isActive={isActive}
                          inputProps={input}
                        />
                      )}
                    </Field>
                  )}
                </Field>
              ),
          },
        },
        {
          name: 'auth',
          label: t('Auth#'),
          options: {
            sort: false,
            customBodyRenderLite: (dataIndex) =>
              dataIndex === 0 ? (
                <TextFieldComponent
                  classes={{ root: classes.textFieldRoot }}
                  disabled={!allChecked || data.length < 2}
                  defaultValue={auth}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => {
                    applyAuthToAllFields(e.target.value);
                  }}
                  error={authError}
                  touched={allChecked}
                />
              ) : (
                <Field
                  name={`taxExemptions[${dataIndex - 1}].selected`}
                  subscription={{ value: true }}
                >
                  {({ input: { value: isActive } }) => (
                    <TextField
                      classes={{ root: classes.textFieldRoot }}
                      name={`taxExemptions[${dataIndex - 1}].auth`}
                      disabled={!isActive}
                    />
                  )}
                </Field>
              ),
          },
        },
      ]}
      data={data}
      options={{
        pagination: false,
        selectableRowsHeader: true,
        setRowProps: (row, dataIndex) => ({
          className: cs({ [classes.allTaxDistrictsRow]: dataIndex === 0 }),
        }),
      }}
    />
  );
};

export default TaxExemptionFormContent;
