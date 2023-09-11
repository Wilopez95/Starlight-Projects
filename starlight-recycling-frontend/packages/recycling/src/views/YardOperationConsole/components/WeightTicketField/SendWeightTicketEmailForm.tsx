import React, { FC } from 'react';
import { Trans } from '../../../../i18n';
import { Form, FormSpy } from 'react-final-form';
import { ContentLoader, showError, showSuccess, TextField } from '@starlightpro/common';
import { Divider, Box, Button, makeStyles } from '@material-ui/core';
import { validate } from '../../../../utils/forms';
import { WeightTicketSendEmailSchema } from './WeightTicketSendEmailSchema';
import { gql } from '@apollo/client';
import { useSendPdfWeightTicketViaEmailMutation } from '../../../../graphql/api';
import { onSubmitWithErrorHandling } from '@starlightpro/common/utils/forms';

gql`
  mutation sendPdfWeightTicketViaEmail($id: Int!, $email: String!) {
    sendPdfWeightTicketViaEmail(id: $id, email: $email)
  }
`;

const useStyles = makeStyles(
  (theme) => ({
    mainWrap: {
      display: 'flex',
      width: '100%',
      flexDirection: 'column',
    },
    inputWrap: {
      display: 'flex',
      width: '100%',
      paddingBottom: theme.spacing(3),
    },
    buttonWrap: {
      display: 'flex',
      width: '100%',
      justifyContent: 'flex-end',
      padding: theme.spacing(2),
    },
    formWrap: {
      display: 'flex',
      flexDirection: 'column',
      padding: theme.spacing(2),
    },
    loaderWrap: {
      padding: theme.spacing(3),
    },
  }),
  { name: 'SendWeightTicketEmailForm' },
);

interface SendWeightTicketEmailFormProps {
  orderId: number;
  closeWeightTicketModal(): void;
}

export const SendWeightTicketEmailForm: FC<SendWeightTicketEmailFormProps> = ({
  orderId,
  closeWeightTicketModal,
}: SendWeightTicketEmailFormProps) => {
  const [sendPdfWeightTicketViaEmailMutation] = useSendPdfWeightTicketViaEmailMutation();
  const classes = useStyles();

  return (
    <Box className={classes.mainWrap}>
      <Form
        validate={async (values) => await validate(values, WeightTicketSendEmailSchema)}
        onSubmit={onSubmitWithErrorHandling(async ({ email }) => {
          if (!email) {
            return;
          }

          try {
            await sendPdfWeightTicketViaEmailMutation({
              variables: {
                id: orderId,
                email: email,
              },
            });

            showSuccess(<Trans>Email sent</Trans>);
          } catch (e) {
            showError(<Trans>Failed to send</Trans>);
          }

          closeWeightTicketModal();
        })}
        render={({ handleSubmit }) => (
          <form onSubmit={handleSubmit} className={classes.formWrap}>
            <Box className={classes.inputWrap}>
              <TextField fullWidth name="email" type="email" label={<Trans>Email</Trans>} />
            </Box>
            <Divider />
            <Box className={classes.buttonWrap}>
              <FormSpy
                subscription={{
                  pristine: true,
                  submitting: true,
                  validating: true,
                  invalid: true,
                }}
              >
                {({ submitting, invalid, pristine, validating }) => {
                  if (submitting) {
                    return (
                      <Box className={classes.loaderWrap}>
                        <ContentLoader />
                      </Box>
                    );
                  }

                  return (
                    <Button
                      type="submit"
                      variant="contained"
                      color="primary"
                      disabled={pristine || validating || invalid}
                      key="on-submit"
                    >
                      <Trans>Send</Trans>
                    </Button>
                  );
                }}
              </FormSpy>
            </Box>
          </form>
        )}
      />
    </Box>
  );
};
