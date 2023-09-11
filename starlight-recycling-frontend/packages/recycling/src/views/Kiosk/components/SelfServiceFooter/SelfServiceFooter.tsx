import React, { ReactElement, useCallback, useMemo } from 'react';
import { Button } from '@material-ui/core';
import { Trans } from '../../../../i18n';
import { CreateButton } from '../../../YardOperationConsole/components/CreateButton';
import ArrowForwardIcon from '@material-ui/icons/ArrowForward';
import Box from '@material-ui/core/Box';
import { useHistory } from 'react-router-dom';
import { useParams } from 'react-router';
import { ParamsKeys } from '../../../../routes/Params';
import { pathToUrl } from '../../../../routes';
import { AnyObject } from '@starlightpro/common';
import { makeStyles } from '@material-ui/core/styles';
import { FormSpy } from 'react-final-form';
import { closeModal, openModal } from '@starlightpro/common/components/Modals';
import YouHaveUnsavedChanges from '@starlightpro/common/components/Modal/YouHaveUnsavedChanges';

export const selfServiceFooterHeight = 55;

const useStyles = makeStyles(() => ({
  root: {
    height: selfServiceFooterHeight,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
}));

export interface ISelfServiceFooter {
  prevPage: string;
  nextPage?: string; // todo: implement when all steps are ready
  submitText?: ReactElement;
  disableSubmitWhenPristine?: boolean;
  disableNextStep?: boolean;
  isWeightCapturing?: boolean;

  handleSubmit?(): Promise<void | AnyObject | undefined> | void;
  onGoNextStep?(): Promise<void | AnyObject | undefined> | void;
}

export const SelfServiceFooter: React.FC<ISelfServiceFooter> = ({
  prevPage,
  nextPage,
  handleSubmit,
  onGoNextStep,
  submitText,
  disableNextStep,
  isWeightCapturing = false,
  disableSubmitWhenPristine = false,
}) => {
  const history = useHistory();
  const { orderId, scaleId } = useParams<ParamsKeys>();
  const classes = useStyles();

  const handleGoBack = useCallback(() => {
    closeModal();

    const route = pathToUrl(prevPage, {
      scaleId,
      orderId,
    });

    history.push(route);
  }, [prevPage, scaleId, orderId, history]);

  const handleGoBackWithFormCheck = useCallback(
    (dirty: boolean) => {
      if (dirty) {
        openModal({
          content: <YouHaveUnsavedChanges onCancel={handleGoBack} onConfirm={closeModal} />,
        });
      } else {
        handleGoBack();
      }
    },
    [handleGoBack],
  );

  const handleGoNextStep = useCallback(async () => {
    if (!nextPage) {
      return;
    }

    if (onGoNextStep) {
      await onGoNextStep();
    }

    const route = pathToUrl(nextPage, {
      scaleId,
      orderId,
    });

    history.push(route);
  }, [nextPage, scaleId, orderId, history, onGoNextStep]);

  const ButtonWrap = useMemo(
    () => ({ children: Component }: { children: React.FC<{ dirty?: boolean }> }) =>
      handleSubmit ? (
        <FormSpy
          subscription={{
            dirty: true,
          }}
        >
          {({ dirty }) => <Component dirty={dirty} />}
        </FormSpy>
      ) : (
        <Component />
      ),
    [handleSubmit],
  );

  return (
    <Box className={classes.root}>
      <ButtonWrap>
        {({ dirty }) => (
          <>
            <Button onClick={() => handleGoBackWithFormCheck(!!dirty)} variant="outlined">
              <Trans>Back</Trans>
            </Button>
            {handleSubmit ? (
              <CreateButton
                isWeightCapturing={isWeightCapturing}
                onSubmit={async () => {
                  await handleSubmit();
                  handleGoNextStep();
                }}
                text={submitText}
                disabled={disableNextStep}
                disableWhenPristine={disableSubmitWhenPristine}
                endIcon={<ArrowForwardIcon />}
              />
            ) : (
              <Button
                onClick={handleGoNextStep}
                disabled={disableNextStep}
                variant="contained"
                color="primary"
                endIcon={<ArrowForwardIcon />}
              >
                {submitText}
              </Button>
            )}
          </>
        )}
      </ButtonWrap>
    </Box>
  );
};
