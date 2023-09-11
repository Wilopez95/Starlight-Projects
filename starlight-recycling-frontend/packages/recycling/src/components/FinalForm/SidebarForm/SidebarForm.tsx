import React, { ComponentType, PropsWithChildren, ReactElement } from 'react';
import { get, isEmpty } from 'lodash-es';
import { ObjectSchema } from 'yup';
import Button from '@material-ui/core/Button';
import CircularProgress from '@material-ui/core/CircularProgress';
import { Trans, useTranslation } from '../../../i18n';
import { Box } from '@material-ui/core';
import Typography from '@material-ui/core/Typography';
import { ValidationErrors, Mutator, MutableState, FORM_ERROR } from 'final-form';
import { Form, FormProps, FormSpy } from 'react-final-form';
import { createStyles, makeStyles } from '@material-ui/core/styles';
import { Protected, validateSchema } from '@starlightpro/common';
import SidepanelView from '../../SidepanelView';

export interface SidebarFormProps<
  FormValues = Record<string, any>,
  InitialFormValues = Partial<FormValues>
> extends FormProps<FormValues, InitialFormValues> {
  create?: boolean;
  isJobSite?: boolean;
  canDuplicate?: boolean;
  cancelable?: boolean;
  deletePermissions?: string | string[];
  submitPermissions?: string | string[];
  initialValues: InitialFormValues;
  title?: JSX.Element | string;
  toolbar?: React.ReactElement | null;
  submitLabel?: JSX.Element;
  schema?: ObjectSchema<any>;
  validate?: (values: FormValues) => ValidationErrors | Promise<ValidationErrors> | undefined;
  mutators?: { [key: string]: Mutator<FormValues, InitialFormValues> };
  onChange?(values: FormValues): void;
  onCancel(): void;
  onSubmitted?: (values: FormValues, result?: any) => void;
  onSubmit(values: FormValues, form?: any): Promise<any>;
  onDelete?(): Promise<any>;
  onDuplicate?(values: FormValues): void;
  WrapperComponent?: ComponentType;
  FooterComponent?: ComponentType;
  noActions?: boolean;
  noHeaderDivider?: boolean;
  classes?: {
    paper?: string;
    header?: string;
    footer?: string;
    content?: string;
  };
  footerActions?: ReactElement;
  cancelText?: string;
}

export const setSubmitError: Mutator<any, any> = ([error], state: MutableState<any>) => {
  state.formState.submitError = error;
};

const useStyles = makeStyles(
  ({ spacing, palette }) =>
    createStyles({
      actionsGroup: {
        '& > *': {
          marginLeft: spacing(2),
        },
        '& > *:first-child': {
          marginLeft: 0,
        },
      },
      form: {
        display: 'flex',
        flexGrow: 1,
        height: '100%',
      },
      submitButton: {
        backgroundColor: palette.coreGreenSumbit ?? palette.primary.main,
        color: palette.common.white,
        '&.Mui-disabled': {
          background: palette.coreGreenSumbit ?? palette.primary.main,
        },
        '&:hover': {
          background: '#109159',
        },
      },
      cancelButtonLabel: {
        color: palette.primary.main,
      },
    }),
  {
    name: 'SidebarForm',
  },
);

export interface FormError {
  message: string;
}

export function SidebarForm<
  FormValues = Record<string, any>,
  InitialFormValues = Partial<FormValues>
>({
  initialValues,
  schema,
  children,
  mutators,
  title,
  validate,
  submitPermissions,
  deletePermissions,
  toolbar,
  submitLabel,
  onCancel,
  create,
  canDuplicate,
  isJobSite,
  onChange,
  onSubmit,
  onSubmitted,
  onDelete,
  onDuplicate,
  decorators,
  subscription,
  noActions,
  classes: classesOverrides,
  footerActions,
  cancelable,
  noHeaderDivider,
  WrapperComponent = React.Fragment,
  FooterComponent = React.Fragment,
  cancelText,
}: PropsWithChildren<SidebarFormProps<FormValues, InitialFormValues>>): ReactElement<
  any,
  any
> | null {
  const [t] = useTranslation();
  const classes = useStyles();
  const isCreate = create;
  let formValidate = validate;

  if (!formValidate) {
    formValidate = validateSchema(schema);
  }

  return (
    <Form<FormValues, InitialFormValues>
      initialValues={initialValues}
      validate={formValidate}
      decorators={decorators}
      mutators={{
        ...mutators,
        setSubmitError,
      }}
      subscription={subscription}
      onSubmit={async (values, form) => {
        try {
          const result = await onSubmit(values);

          if (result === false) {
            // submit is not final
            return;
          }

          form.initialize(values);

          if (onSubmitted) {
            onSubmitted(values, result);
          }
        } catch (e) {
          const formErrors: any = {};
          let errors = e.graphQLErrors;

          if (!errors || errors.length === 0) {
            const networkError = e.networkError;

            const result = networkError?.result;

            if (result && result.errors && result.errors.length > 0) {
              errors = result.errors;
            }
          }

          if (errors) {
            let formErrorList: string[] = [];

            errors.forEach((e: any) => {
              const message = e.message;

              if (message === 'Argument Validation Error') {
                const validationErrors = get(e, 'extensions.exception.validationErrors');

                if (validationErrors) {
                  validationErrors.forEach((validationError: any) => {
                    formErrors[validationError.property] = Object.values(
                      validationError.constraints,
                    ).join(', ');
                  });
                }
              } else if (message === 'Invalid request' && isJobSite) {
                formErrorList.push(
                  'Please enter a valid address within the country of Facility (Business Unit)',
                );
              } else if (message.indexOf('duplicate key') !== -1) {
                formErrorList.push('Already exists');
              } else {
                formErrorList.push(message);
              }
            });

            // TODO: this is general problem, will fix this in future request
            formErrorList = formErrorList.filter(
              (message) => message.indexOf('Cannot return null for non-nullable field') === -1,
            );

            if (formErrorList.length > 0) {
              formErrors[FORM_ERROR] = formErrorList.join(',\n');
            }
          } else {
            formErrors[FORM_ERROR] = e.message;
          }

          return formErrors;
        }
      }}
      render={({ handleSubmit }) => (
        <form onSubmit={handleSubmit} className={classes.form}>
          <SidepanelView
            onClose={onCancel}
            title={title}
            toolbar={toolbar}
            noHeaderDivider={noHeaderDivider}
            WrapperComponent={WrapperComponent}
            FooterComponent={FooterComponent}
            classes={classesOverrides}
            actions={
              noActions ? (
                footerActions
              ) : (
                <>
                  <Box className={classes.actionsGroup}>
                    {canDuplicate && onDuplicate && (
                      <FormSpy<FormValues> subscription={{ values: true }}>
                        {({ values }) => (
                          <Button variant="outlined" onClick={() => onDuplicate(values)}>
                            <Trans>Duplicate</Trans>
                          </Button>
                        )}
                      </FormSpy>
                    )}
                    {((cancelable || isCreate) && (
                      <Button
                        key="on-cancel"
                        variant="outlined"
                        onClick={onCancel}
                        classes={{
                          label: classes.cancelButtonLabel,
                        }}
                      >
                        {cancelText ? cancelText : <Trans>Cancel</Trans>}
                      </Button>
                    )) ||
                      (onDelete && (
                        <Protected permissions={deletePermissions}>
                          <FormSpy subscription={{}}>
                            {({ form }) => (
                              <Button
                                key="on-delete"
                                variant="contained"
                                color="secondary"
                                onClick={async () => {
                                  try {
                                    await onDelete();
                                  } catch (error) {
                                    form.mutators.setSubmitError(error.message);
                                  }
                                }}
                              >
                                <Trans>Delete</Trans>
                              </Button>
                            )}
                          </FormSpy>
                        </Protected>
                      ))}
                    {footerActions}
                  </Box>
                  <Box className={classes.actionsGroup}>
                    <Protected permissions={submitPermissions}>
                      <FormSpy
                        subscription={{
                          errors: true,
                          pristine: true,
                          submitting: true,
                          validating: true,
                          invalid: true,
                          submitSucceeded: true,
                          submitFailed: true,
                          dirtySinceLastSubmit: true,
                        }}
                      >
                        {({
                          submitting,
                          invalid,
                          pristine,
                          validating,
                          submitSucceeded,
                          submitFailed,
                          dirtySinceLastSubmit,
                          errors,
                        }) => (
                          <Button
                            {...(isCreate && {
                              className: classes.submitButton,
                            })}
                            type="submit"
                            data-cy="Save Changes"
                            variant="contained"
                            color="primary"
                            disabled={
                              pristine ||
                              submitting ||
                              validating ||
                              (invalid && !isEmpty(errors)) ||
                              ((submitSucceeded || submitFailed) && !dirtySinceLastSubmit)
                            }
                            key="on-submit"
                          >
                            {(submitting && <CircularProgress size={20} />) ||
                              (isCreate && (submitLabel || <Trans>Create</Trans>)) ||
                              submitLabel || <Trans>Save Changes</Trans>}
                          </Button>
                        )}
                      </FormSpy>
                    </Protected>
                  </Box>
                </>
              )
            }
          >
            <FormSpy subscription={{ submitError: true }}>
              {({ submitError }) =>
                (submitError && (
                  <Box>
                    <Typography color="error">{t(submitError)}</Typography>
                    <br />
                  </Box>
                )) ||
                null
              }
            </FormSpy>
            {onChange && (
              <FormSpy<FormValues> subscription={{ values: true }}>
                {({ values }) => {
                  onChange(values);

                  return null;
                }}
              </FormSpy>
            )}
            {children}
          </SidepanelView>
        </form>
      )}
    />
  );
}
