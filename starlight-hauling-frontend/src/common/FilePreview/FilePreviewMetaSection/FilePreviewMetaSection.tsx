import React, { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Layouts } from '@starlightpro/shared-components';
import { format } from 'date-fns-tz';

import { DeleteIcon, DownloadIcon, EmailIcon } from '@root/assets';
import { handleEnterOrSpaceKeyDown, parseDate } from '@root/helpers';
import { useIntl } from '@root/i18n/useIntl';

import { Typography } from '../../Typography/Typography';

import { ModalActionButton } from './components/ModalActionButton';
import { IFilePreviewMetaSection } from './types';

import styles from './css/styles.scss';

const I18N_PATH = 'common.FilePreview.FilePreviewMetaSection.Text.';

export const MetaSection: React.FC<IFilePreviewMetaSection> = ({
  fileName,
  timestamp,
  downloadSrc,
  author = 'unknown',
  src = '',
  hideAuthor = false,
  disableSendEmail,
  disableDownload,
  disableRemove,
  onRemove,
}) => {
  const { dateFormat } = useIntl();
  const { t } = useTranslation();

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLOrSVGElement>) => {
      if (handleEnterOrSpaceKeyDown(e)) {
        onRemove?.();
      }
    },
    [onRemove],
  );

  const deleteIcon = useMemo(
    () => (
      <DeleteIcon
        role="button"
        aria-label={t(`${I18N_PATH}Remove`)}
        tabIndex={0}
        onKeyDown={handleKeyDown}
      />
    ),
    [handleKeyDown, t],
  );
  const downloadIcon = useMemo(() => <DownloadIcon />, []);
  const emailIcon = useMemo(() => <EmailIcon />, []);

  return (
    <>
      <Typography variant="headerThree">{fileName}</Typography>
      {!hideAuthor ? (
        <Layouts.Margin top="1" bottom="1">
          <Typography variant="bodyMedium" className={styles.author}>
            {t(`${I18N_PATH}AttachedByAuthor`, { author })}
          </Typography>
        </Layouts.Margin>
      ) : null}
      <Layouts.Margin bottom="3">
        <Layouts.Flex alignItems="center" justifyContent="space-between">
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
          <Layouts.Flex>
            {onRemove ? (
              <ModalActionButton onClick={onRemove} icon={deleteIcon} disable={disableRemove}>
                {t(`${I18N_PATH}Remove`)}
              </ModalActionButton>
            ) : null}

            <ModalActionButton
              icon={downloadIcon}
              disable={disableDownload}
              url={downloadSrc ?? src}
              target="_blank"
              rel="noopener noreferrer"
              download
            >
              {t(`${I18N_PATH}Download`)}
            </ModalActionButton>

            <ModalActionButton
              icon={emailIcon}
              disable={disableSendEmail}
              url={`mailto:%20?body=${downloadSrc ?? src}`}
            >
              {t(`${I18N_PATH}SendToEmail`)}
            </ModalActionButton>
          </Layouts.Flex>
        </Layouts.Flex>
      </Layouts.Margin>
    </>
  );
};
