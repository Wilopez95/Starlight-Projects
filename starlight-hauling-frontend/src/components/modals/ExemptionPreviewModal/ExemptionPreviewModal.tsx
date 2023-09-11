import React, { useCallback, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Layouts } from '@starlightpro/shared-components';
import cx from 'classnames';
import { format } from 'date-fns-tz';

import { DeleteIcon, DownloadIcon, PdfPlaceholderIcon } from '@root/assets';
import { Modal, Typography } from '@root/common';
import { type IModal } from '@root/common/Modal/types';
import { handleEnterOrSpaceKeyDown, parseDate } from '@root/helpers';
import { useIntl } from '@root/i18n/useIntl';

import styles from './css/styles.scss';

interface IExemptionPreviewModal extends IModal {
  actionsDisabled: boolean;
  src?: string;
  isPdf?: boolean;
  author?: string | null;
  timestamp?: Date | null;
  onFileDelete(): void;
  onFileUpload(): void;
}
interface IEventTargetExtends extends EventTarget {
  ariaLabel: string;
}

const I18N_PATH = 'components.modals.ExemptionPreview.Text.';

const ExemptionPreviewModal: React.FC<IExemptionPreviewModal> = ({
  actionsDisabled,
  isOpen,
  onClose,
  onFileDelete,
  onFileUpload,
  author,
  timestamp,
  isPdf,
  src,
}) => {
  const downloadRef = useRef<HTMLDivElement | null>(null);
  const deleteRef = useRef<HTMLDivElement | null>(null);

  const { dateFormat } = useIntl();
  const { t } = useTranslation();

  const handleKeyDownForDelete = useCallback(
    (e: React.KeyboardEvent<HTMLOrSVGElement>) => {
      if (handleEnterOrSpaceKeyDown(e)) {
        const target = e.target as IEventTargetExtends;
        if (target.ariaLabel === t('Text.Delete')) {
          onFileDelete();
        } else {
          onFileUpload();
        }
      }
    },
    [onFileDelete, onFileUpload, t],
  );

  const handleKeyDownForUpload = useCallback(
    (e: React.KeyboardEvent<HTMLOrSVGElement>) => {
      if (handleEnterOrSpaceKeyDown(e)) {
        onFileUpload();
      }
    },
    [onFileUpload],
  );

  return (
    <Modal className={styles.modal} isOpen={isOpen} onClose={onClose}>
      <Typography variant="headerFour">{t(`${I18N_PATH}Title`)}</Typography>
      <Layouts.Margin top="3" bottom="3" right="1">
        <Layouts.Flex justifyContent="space-between">
          <div>
            {author ? (
              <Typography variant="bodyMedium">
                {t(`${I18N_PATH}AttachedByAuthor`, { author })}
              </Typography>
            ) : null}
            {timestamp ? (
              <time dateTime={format(parseDate(timestamp), dateFormat.dateTime)}>
                <Typography variant="bodyMedium" as="span">
                  {' '}
                  {format(parseDate(timestamp), dateFormat.time)}
                </Typography>
                ・
                <Typography variant="bodyMedium" color="secondary" as="span">
                  {format(parseDate(timestamp), dateFormat.date)}
                </Typography>
              </time>
            ) : (
              <Typography variant="bodyMedium" color="secondary">
                {t(`${I18N_PATH}TimeUnknown`)}
              </Typography>
            )}
          </div>
          <Layouts.Margin left="auto">
            <Layouts.Flex>
              <Typography
                ref={downloadRef}
                variant="bodyMedium"
                color={actionsDisabled ? 'secondary' : 'information'}
                className={cx(styles.action, actionsDisabled && styles.disabled)}
                onClick={actionsDisabled ? undefined : onFileUpload}
              >
                <DownloadIcon
                  role="button"
                  aria-label={t('Text.UploadNew')}
                  tabIndex={actionsDisabled ? -1 : 0}
                  onKeyDown={handleKeyDownForUpload}
                />
                {t('Text.UploadNew')}
              </Typography>
              <Typography
                ref={deleteRef}
                variant="bodyMedium"
                color={actionsDisabled ? 'secondary' : 'information'}
                className={cx(styles.action, actionsDisabled && styles.disabled)}
                onClick={actionsDisabled ? undefined : onFileDelete}
              >
                <DeleteIcon
                  role="button"
                  aria-label={t('Text.Delete')}
                  tabIndex={actionsDisabled ? -1 : 0}
                  onKeyDown={handleKeyDownForDelete}
                />
                {t('Text.Delete')}
              </Typography>
            </Layouts.Flex>
          </Layouts.Margin>
        </Layouts.Flex>
      </Layouts.Margin>
      {isPdf || src?.endsWith('.pdf') ? (
        <div className={styles.modalPreview} role="img">
          <PdfPlaceholderIcon className={styles.pdfPlaceholder} />
        </div>
      ) : (
        <img className={styles.modalPreview} alt="Tax Exemption Preview" src={src} />
      )}
    </Modal>
  );
};

export default ExemptionPreviewModal;
