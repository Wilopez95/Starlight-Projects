import React, { FC, ReactElement, useMemo } from 'react';
import { isEmpty } from 'lodash/fp';
import { Trans } from '../../../../i18n';
import { FormSpy } from 'react-final-form';
import { Box, Button, ButtonProps, CircularProgress } from '@material-ui/core';
import { useScale } from '../../../../hooks/useScale';
import { Tooltip } from '@starlightpro/common';
import HelpOutlineRoundedIcon from '@material-ui/icons/HelpOutlineRounded';
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

interface Props extends ButtonProps {
  onSubmit: (values: any) => void;
  disableWhenPristine?: boolean;
  text?: ReactElement;
  isWeightCapturing?: boolean;
  enableIfSubmitFailed?: boolean;
}

export const CreateButton: FC<Props> = ({
  onSubmit,
  text,
  disableWhenPristine = true,
  isWeightCapturing = true,
  enableIfSubmitFailed = false,
  ...props
}) => {
  const styles = useStyles();
  const { enableWeightCapturing, isManual } = useScale();
  let isStabilization = useMemo(() => !enableWeightCapturing && !isManual, [
    enableWeightCapturing,
    isManual,
  ]);

  return (
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
      }) => {
        const disabledByFormState =
          (disableWhenPristine && pristine && !enableIfSubmitFailed) ||
          submitting ||
          validating ||
          (invalid && !isEmpty(errors)) ||
          ((submitSucceeded || submitFailed) && !enableIfSubmitFailed && !dirtySinceLastSubmit) ||
          props.disabled;

        return (
          <Box display="flex" alignItems="center">
            <Tooltip
              title={
                !disabledByFormState && isStabilization ? (
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
              {isWeightCapturing && !disabledByFormState && isStabilization ? (
                <HelpOutlineRoundedIcon className={styles.tooltipIcon} />
              ) : (
                <span />
              )}
            </Tooltip>
            <Button
              type="submit"
              data-cy="Create Order"
              variant="contained"
              color="primary"
              {...props}
              onClick={onSubmit}
              disabled={(isWeightCapturing && isStabilization) || disabledByFormState}
              key="on-submit"
            >
              {submitting && <CircularProgress size={20} color="inherit" />} &nbsp;
              {text ? text : <Trans>Create Order</Trans>}
            </Button>
          </Box>
        );
      }}
    </FormSpy>
  );
};
