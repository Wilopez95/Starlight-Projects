import React, { FC, useCallback, useMemo } from 'react';
import { Field, Form, FormSpy } from 'react-final-form';
import { RouterPromptFormTracker } from '../../routes';
import { Box, Button, Divider, Toolbar, Typography } from '@material-ui/core';
import { GradingEditHeader } from './components/GradingEditHeader';
import { MaterialsInfo } from './components/MaterialsInfo';
import { GetGradingOrderQuery, OrderImageInput, useGradingOrderMutation } from '../../graphql/api';
import { MaterialItemField } from './components/MaterialItemField';
import { Trans, useTranslation } from '../../i18n';
import { MiscellaneousItemField } from './components/MiscellaneousItemField';
import { ResetButton } from './components/ResetButton';
import { omit } from 'lodash/fp';
import { showSuccess } from '@starlightpro/common';
import { makeStyles } from '@material-ui/core/styles';
import schema from './schema';
import { GradingOrder } from './types';
import { onSubmitWithErrorHandling } from '@starlightpro/common/utils/forms';
import CircularProgress from '@material-ui/core/CircularProgress';
import { sumMaterials, totalMaterialsDecorator } from './utils';
import cx from 'classnames';

interface Props {
  order: GradingOrder;
  onCancel: () => void;
  onSubmit: () => Promise<void>;
}

const useStyles = makeStyles(({ palette, spacing }) => ({
  root: {
    flexGrow: 1,
    height: '100%',
  },
  form: {
    display: 'flex',
    flexGrow: 1,
    height: '100%',
  },
  column: {
    display: 'flex',
    flexDirection: 'column',
  },
  content: {
    flexGrow: 1,
    overflowY: 'scroll',
    padding: `0 ${spacing(3)}px`,
  },
  footer: {
    borderTop: `1px solid ${palette.grey[200]}`,
    '& button:first-of-type': {
      marginRight: 'auto',
    },
    '& button:last-of-type': {
      marginLeft: spacing(2),
    },
  },
  footerToolbar: {
    padding: spacing(3),
  },
  toolbar: {
    minHeight: 112,
  },
  section: {
    flexGrow: 1,
    marginBottom: spacing(1.5),
  },
}));

const MAX_DISTRIBUTION_VALUE = 100;

export const GradingTabletDetailsForm: FC<Props> = ({ order, onCancel, onSubmit }) => {
  const classes = useStyles();
  const { t } = useTranslation();
  const [gradingOrder] = useGradingOrderMutation();

  const total = useMemo(() => sumMaterials(order.materialsDistribution), [
    order.materialsDistribution,
  ]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const handleSubmit = useCallback(
    onSubmitWithErrorHandling<GradingOrder>(async (values, form) => {
      const omitTypename = omit(['__typename']);
      const images = values.images || [];
      const material = values.materialsDistribution || [];
      const miscellaneous = values.miscellaneousMaterialsDistribution || [];

      await gradingOrder({
        variables: {
          gradingPayload: {
            orderId: values.id,
            images: images.map(omitTypename) as OrderImageInput[],
            materialsDistribution: material.map(({ uuid, value, materialId }) => ({
              uuid,
              value,
              materialId,
            })),
            miscellaneousMaterialsDistribution: miscellaneous.map(
              ({ uuid, quantity, materialId }) => ({
                uuid,
                quantity,
                materialId,
              }),
            ),
          },
        },
      });

      showSuccess(<Trans>Order updated successfully!</Trans>);

      form.initialize(values);

      await onSubmit();
    }),
    [gradingOrder],
  );

  return (
    <Form
      initialValues={{ ...order, total }}
      onSubmit={handleSubmit}
      decorators={[totalMaterialsDecorator]}
      validate={schema}
      subscription={{}}
    >
      {({ handleSubmit }) => (
        <form className={classes.form} onSubmit={handleSubmit}>
          <RouterPromptFormTracker />
          <Box className={cx(classes.column, classes.root)}>
            <GradingEditHeader order={order} />
            <Box className={classes.content}>
              <MaterialsInfo />
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
              <Box>
                <Field<GetGradingOrderQuery['order']['materialsDistribution']>
                  name="materialsDistribution"
                  subscription={{ value: true }}
                >
                  {({ input: { value } }) =>
                    (value || []).map((_, index) => (
                      <Box className={classes.column} key={index}>
                        <MaterialItemField
                          name={`materialsDistribution[${index}]`}
                          max={MAX_DISTRIBUTION_VALUE}
                        />
                      </Box>
                    ))
                  }
                </Field>

                <Divider />

                <Box className={classes.section}>
                  <Toolbar disableGutters>
                    <Box fontWeight={500}>
                      <Typography variant="h5">
                        <Trans>Miscellaneous Items</Trans>
                      </Typography>
                    </Box>
                  </Toolbar>
                </Box>

                <Field<GetGradingOrderQuery['order']['miscellaneousMaterialsDistribution']>
                  name="miscellaneousMaterialsDistribution"
                  subscription={{ value: true }}
                >
                  {({ input: { value } }) =>
                    (value || []).map((_, index) => (
                      <Box className={classes.column} key={index}>
                        <MiscellaneousItemField
                          key={index}
                          name={`miscellaneousMaterialsDistribution[${index}]`}
                        />
                      </Box>
                    ))
                  }
                </Field>
              </Box>
            </Box>
            <Box className={classes.footer}>
              <Toolbar className={classes.footerToolbar}>
                <Button onClick={onCancel} variant="outlined" color="primary">
                  <Trans>Cancel</Trans>
                </Button>
                <FormSpy<GradingOrder>
                  subscription={{
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
                    form,
                    submitting,
                    invalid,
                    pristine,
                    validating,
                    submitSucceeded,
                    submitFailed,
                    dirtySinceLastSubmit,
                  }) => (
                    <>
                      <ResetButton
                        order={order}
                        submitting={submitting}
                        pristine={pristine}
                        form={form}
                      />
                      <Button
                        disabled={
                          pristine ||
                          submitting ||
                          validating ||
                          invalid ||
                          ((submitSucceeded || submitFailed) && !dirtySinceLastSubmit)
                        }
                        variant="contained"
                        color="primary"
                        type="submit"
                      >
                        {(submitting && <CircularProgress size={20} />) || <Trans>Submit</Trans>}
                      </Button>
                    </>
                  )}
                </FormSpy>
              </Toolbar>
            </Box>
          </Box>
        </form>
      )}
    </Form>
  );
};
