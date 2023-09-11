import React, { FC, useCallback, useEffect, useMemo } from 'react';
import { isEmpty } from 'lodash/fp';
import { Trans } from '../../../../i18n';
import { Box, Button } from '@material-ui/core';
import { useForm, useFormState } from 'react-final-form';
import ArrowForwardIcon from '@material-ui/icons/ArrowForward';

import { OrderStatus } from '../../../../graphql/api';
import { useUserIsAllowedToPaymentOrder } from '../../hooks/useUserIsAllowedToPaymentOrder';
import { Tooltip } from '@starlightpro/common';
import HelpOutlineRoundedIcon from '@material-ui/icons/HelpOutlineRounded';
import { useScale } from '../../../../hooks/useScale';
import { createStyles, makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles(({ spacing, palette }) =>
  createStyles({
    tooltip: {
      maxWidth: '200px',
      backgroundColor: palette.text.primary,
    },
    tooltipArrow: {
      color: palette.text.primary,
    },
    tooltipIcon: {
      width: '2rem',
      height: '2rem',
      marginRight: spacing(1),
      color: palette.grey[600],
      cursor: 'pointer',
    },
  }),
);

export interface ToPaymentButtonProps {
  isWeightCapturing?: boolean;
}

export const ToPaymentButton: FC<ToPaymentButtonProps> = ({ isWeightCapturing = true }) => {
  const form = useForm();
  const {
    submitting,
    invalid,
    validating,
    submitSucceeded,
    submitFailed,
    dirtySinceLastSubmit,
    errors,
  } = useFormState({
    subscription: {
      errors: true,
      submitting: true,
      validating: true,
      invalid: true,
      submitSucceeded: true,
      submitFailed: true,
      dirtySinceLastSubmit: true,
    },
  });
  const isAllowedToPaymentOrder = useUserIsAllowedToPaymentOrder();

  const onMoveToPayment = useCallback(async () => {
    form.change('status', OrderStatus.Payment);
    form.submit();
  }, [form]);

  const disabled =
    !isAllowedToPaymentOrder ||
    submitting ||
    validating ||
    (invalid && !isEmpty(errors)) ||
    ((submitSucceeded || submitFailed) && !dirtySinceLastSubmit);

  useEffect(() => {
    //Test in QA
    // eslint-disable-next-line no-console
    console.log('🚀 ~ file: ToPaymentButton.tsx ~ errors', errors);
  }, [errors]);

  const styles = useStyles();
  const { enableWeightCapturing, isManual } = useScale();
  const isStabilization = useMemo(() => isWeightCapturing && !enableWeightCapturing && !isManual, [
    enableWeightCapturing,
    isManual,
    isWeightCapturing,
  ]);

  return (
    <Box display="flex" alignItems="center">
      <Tooltip
        title={
          !disabled && isStabilization ? (
            <Trans>Weight can not be captured because scales are not stabilized.</Trans>
          ) : (
            ''
          )
        }
        placement="top-start"
        classes={{
          tooltip: styles.tooltip,
          arrow: styles.tooltipArrow,
        }}
        arrow
      >
        {!disabled && isStabilization ? (
          <HelpOutlineRoundedIcon className={styles.tooltipIcon} />
        ) : (
          <span />
        )}
      </Tooltip>
      <Button
        variant="contained"
        color="primary"
        endIcon={<ArrowForwardIcon />}
        disabled={isStabilization || disabled}
        onClick={onMoveToPayment}
        type="submit"
      >
        <Trans>To Payment</Trans>
      </Button>
    </Box>
  );
};
