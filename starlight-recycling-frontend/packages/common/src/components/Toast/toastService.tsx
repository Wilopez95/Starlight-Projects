import React, { ReactNode } from 'react';
import { Trans } from 'react-i18next';
import { toast, ToastContent } from 'react-toastify';

import { RefreshToast } from './RefreshToast';

interface AsyncAlterOptions {
  progressMessage?: ReactNode;
  successMessage?: ReactNode;
  errorMessage?: ReactNode;
}

interface RefreshAlterOptions {
  refreshMessage?: ReactNode;
  errorMessage?: ReactNode;
}

export const showSuccess = (message: ReactNode) => {
  toast.success(message);
};

export const showError = (message: ReactNode) => {
  toast.error(message);
};

export const showForbidden = () => showError(<Trans>Forbidden</Trans>);

export const showInfo = (content: ToastContent, persist?: boolean) => {
  toast.info(content, { autoClose: persist ? false : undefined });
};

export const showAsyncToast = async (
  { progressMessage, errorMessage, successMessage }: AsyncAlterOptions,
  ...promises: Array<Promise<any>>
) => {
  const progressToastId = toast.info(<RefreshToast message={progressMessage} />);

  try {
    await Promise.all(promises);
    toast.dismiss(progressToastId);

    if (successMessage) {
      toast.success(successMessage);
    }
  } catch (e) {
    toast.dismiss(progressToastId);

    if (errorMessage) {
      toast.error(errorMessage);
    }
  }
};

export const showRefresh = async (
  { refreshMessage, errorMessage }: RefreshAlterOptions,
  ...promises: Array<Promise<any>>
) => showAsyncToast({ progressMessage: refreshMessage, errorMessage }, ...promises);
