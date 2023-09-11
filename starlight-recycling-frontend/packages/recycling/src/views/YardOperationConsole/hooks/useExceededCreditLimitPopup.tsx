import React, { useMemo } from 'react';
import { closeModal, openModal } from '@starlightpro/common/components/Modals';
import { ConfirmModal, showError } from '@starlightpro/common';
import { Trans, useTranslation } from '../../../i18n';
import { createStyles, makeStyles } from '@material-ui/core/styles';
import { useUserIsAllowedToOverrideCreditLimit } from './useUserIsAllowedToOverrideCreditLimit';

const useStyles = makeStyles(
  () =>
    createStyles({
      root: {
        maxWidth: 450,
      },
    }),
  {
    name: 'CreditOverlimitForm',
  },
);

export const useExceededCreditLimitPopup = () => {
  const classes = useStyles();
  const isAllowedToOverrideCreditLimit = useUserIsAllowedToOverrideCreditLimit();
  const [t] = useTranslation();

  let description = t('Looks like order total over exceeded available credit limit.');

  if (isAllowedToOverrideCreditLimit) {
    description += ` ${t('Are you sure want to place this order and over exceed the limit?')}`;
  } else {
    description += ` ${t('You have insufficient privileges to place this order.')}`;
  }

  return useMemo(() => {
    return (onConfirm?: () => Promise<any>) => {
      return new Promise((resolve, reject) => {
        openModal({
          content: (
            <ConfirmModal
              title={<Trans>Credit Overlimit</Trans>}
              cancelLabel={<Trans>Edit Order</Trans>}
              confirmLabel={<Trans>Override Limit</Trans>}
              classes={{
                root: classes.root,
              }}
              description={description}
              hideConfirm={!isAllowedToOverrideCreditLimit}
              onConfirm={async () => {
                try {
                  if (onConfirm) {
                    await onConfirm();
                  }
                  resolve(null);
                  closeModal();
                } catch (e) {
                  showError(e.message);
                }
              }}
              onCancel={() => {
                closeModal();
                reject(new Error());
              }}
            />
          ),
          onClose: async () => {
            reject(new Error());
          },
        });
      });
    };
  }, [classes.root, description, isAllowedToOverrideCreditLimit]);
};
