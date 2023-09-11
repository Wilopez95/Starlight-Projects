import React, { FC, useCallback } from 'react';
import { Field, FormSpy, useForm } from 'react-final-form';
import { Trans } from '../../../../i18n';

import { Box, Divider, makeStyles } from '@material-ui/core';
import { CustomerType, OrderStatus } from '../../../../graphql/api';
import { DeleteButton } from '../../components/DeleteButton';
import { SaveButton } from '../../components/SaveButton';
import { DoneToScaleButton } from '../../components/DoneToScaleButton';
import { DoneBypassScaleButton } from '../../components/DoneBypassScaleButton';
import YouHaveUnsavedChanges from '../../../../components/Modal/YouHaveUnsavedChanges';
import { openModal, closeModal } from '../../../../components/Modals';
import Alert from '../../../../components/Modal/Alert';
import {
  useUserIsAllowedToDoneBypassScale,
  useUserIsAllowedToWeightOutOrder,
} from '../../hooks/useUserIsAllowedToWeightOutOrder';
import { useCompanyMeasurementUnits } from '../../../../hooks/useCompanyMeasurementUnits';

const useStyles = makeStyles(({ spacing }) => ({
  footer: {
    padding: spacing(0, 4, 3, 4),
    display: 'flex',
    flexDirection: 'column',
    flexShrink: 0,
  },
  rightActions: {
    '& > *': {
      marginRight: spacing(2),
    },
    '& > *:last-child': {
      marginRight: 0,
    },
  },
  leftActions: {
    '& > *': {
      marginRight: spacing(2),
    },
    '& > *:last-child': {
      marginRight: 0,
    },
  },
}));

interface Props {
  orderId: number;
}

export const ArrivalDumpOrderFooter: FC<Props> = ({ orderId }) => {
  const classes = useStyles();
  const form = useForm();
  const { convertWeights } = useCompanyMeasurementUnits();
  const isAllowedToWeightOutOrder = useUserIsAllowedToWeightOutOrder();
  const isAllowedToDoneBypassScale = useUserIsAllowedToDoneBypassScale();
  const showNotRequiredPopup = useCallback((onConfirm: () => void) => {
    openModal({
      content: (
        <YouHaveUnsavedChanges
          title={<Trans>Warning</Trans>}
          description={
            <Trans>Material percentages should equal 100%. Do you still want to continue?</Trans>
          }
          confirmLabel={<Trans>Confirm</Trans>}
          cancelLabel={<Trans>Cancel</Trans>}
          onConfirm={() => {
            closeModal();
            onConfirm();
          }}
          onCancel={closeModal}
        />
      ),
    });
  }, []);

  const showRequiredPopup = useCallback(() => {
    openModal({
      content: (
        <Alert
          title={<Trans>Grading required</Trans>}
          description={<Trans>Material percentages should equal 100%</Trans>}
        />
      ),
    });
  }, []);

  const showGradingValidationPopup = useCallback(
    (values: any, onConfirm: () => void) => {
      const customer = values.customer;

      if (!customer || values.materialsDistributionTotal === 100) {
        onConfirm();

        return;
      }

      if (!customer?.gradingRequired && customer?.gradingNotification) {
        showNotRequiredPopup(onConfirm);

        return;
      } else if (customer?.gradingRequired && customer?.gradingNotification) {
        showRequiredPopup();

        return;
      }

      onConfirm();
    },
    [showNotRequiredPopup, showRequiredPopup],
  );

  return (
    <Box className={classes.footer}>
      <Divider />
      <Box display="flex" flexShrink="0" justifyContent="space-between" alignItems="flex-end">
        <Box display="flex" mt={3} className={classes.leftActions}>
          <Field name="departureAt" subscription={{ value: true }}>
            {({ input }) => !input.value && <DeleteButton orderId={orderId} />}
          </Field>
          <SaveButton />
        </Box>
        <Box display="flex" className={classes.rightActions}>
          <FormSpy subscription={{ values: true }}>
            {({ values }) => (
              <>
                {values.customer?.type !== CustomerType.Walkup && (
                  <DoneBypassScaleButton
                    disabled={!isAllowedToDoneBypassScale}
                    handleSubmit={() => {
                      showGradingValidationPopup(values, () => {
                        form.change('status', OrderStatus.WeightOut);
                        form.change(
                          'weightOut',
                          convertWeights(values.containerWeight + values.customerTruck.emptyWeight),
                        );
                        form.change('bypassScale', true);
                        form.submit();
                      });
                    }}
                  />
                )}
                <DoneToScaleButton
                  disabled={!isAllowedToWeightOutOrder}
                  handleSubmit={() =>
                    showGradingValidationPopup(values, () => {
                      form.change('status', OrderStatus.WeightOut);
                      form.change('bypassScale', false);
                      form.submit();
                    })
                  }
                />
              </>
            )}
          </FormSpy>
        </Box>
      </Box>
    </Box>
  );
};
