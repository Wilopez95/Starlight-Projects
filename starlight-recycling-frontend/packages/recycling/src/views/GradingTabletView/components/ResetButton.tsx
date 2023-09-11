import React, { FC, memo, useCallback, cloneElement, isValidElement } from 'react';
import { FormApi } from 'final-form';
import { Trans } from '../../../i18n';
import { Button } from '@material-ui/core';
import { GradingOrder } from '../types';

interface ResetButtonProps {
  form: FormApi<GradingOrder>;
  order: GradingOrder;
  submitting: boolean;
  pristine: boolean;
  customButton?: React.ReactNode;
}

export const ResetButton: FC<ResetButtonProps> = memo(
  ({ customButton, form, order, submitting, pristine }) => {
    const handleReset = useCallback(() => {
      form.change('materialsDistribution', order.materialsDistribution);
      form.change('miscellaneousMaterialsDistribution', order.miscellaneousMaterialsDistribution);
    }, [form, order]);

    if (customButton && isValidElement(customButton)) {
      return cloneElement(customButton, {
        onClick: handleReset,
      });
    }

    return (
      <Button
        disabled={submitting || pristine}
        onClick={handleReset}
        variant="outlined"
        color="primary"
      >
        <Trans>Reset</Trans>
      </Button>
    );
  },
);
