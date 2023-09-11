import print from 'print-js';
import { i18n, showError } from '@starlightpro/common';

interface PrintDialogParams {
  url: string;
  type?: 'pdf' | 'html' | 'image' | 'json' | 'raw-html';
}

export const printDialog = ({ url, type }: PrintDialogParams) => {
  if (!url) {
    showError(i18n.t('Url of weight ticket pdf file is empty'));

    return;
  }

  if (navigator.userAgent.indexOf('Firefox') > -1) {
    window.open(url, '_blank')?.focus();
  } else {
    print({ printable: url, type: type });
  }
};

export default printDialog;
