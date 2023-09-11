import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Layouts, Typography } from '@starlightpro/shared-components';
import { format, utcToZonedTime } from 'date-fns-tz';

import { DeleteIcon, DownloadIcon, EmailIcon } from '@root/assets';
import { useTimeZone } from '@root/core/hooks';
import { useIntl } from '@root/core/i18n/useIntl';

import { ModalActionButton } from './componetns/ModalActionButton';
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
  showSendEmail,
}) => {
  const { timeZone } = useTimeZone();
  const { dateFormat } = useIntl();
  const { t } = useTranslation();

  const deleteIcon = useMemo(() => <DeleteIcon />, []);
  const downloadIcon = useMemo(() => <DownloadIcon />, []);
  const emailIcon = useMemo(() => <EmailIcon />, []);

  return (
    <>
      <Typography variant='headerThree'>{fileName}</Typography>
      {!hideAuthor && (
        <Layouts.Margin top='1' bottom='1'>
          <Typography variant='bodyMedium' className={styles.author}>
            {t(`${I18N_PATH}AttachedByAuthor`, { author })}
          </Typography>
        </Layouts.Margin>
      )}
      <Layouts.Margin bottom='3'>
        <Layouts.Flex alignItems='center' justifyContent='space-between'>
          {timestamp ? (
            <time
              dateTime={format(utcToZonedTime(timestamp, timeZone), dateFormat.dateTime, {
                timeZone,
              })}
            >
              <Typography variant='bodyMedium' as='span'>
                {' '}
                {format(utcToZonedTime(timestamp, timeZone), dateFormat.time, {
                  timeZone,
                })}
              </Typography>
              ・
              <Typography variant='bodyMedium' color='secondary' as='span'>
                {format(utcToZonedTime(timestamp, timeZone), dateFormat.date, {
                  timeZone,
                })}
              </Typography>
            </time>
          ) : (
            <Typography variant='bodyMedium' color='secondary'>
              {t(`${I18N_PATH}TimeUnknown`)}
            </Typography>
          )}
          <Layouts.Flex>
            {onRemove && (
              <ModalActionButton onClick={onRemove} icon={deleteIcon} disable={disableRemove}>
                {t(`${I18N_PATH}Remove`)}
              </ModalActionButton>
            )}

            <ModalActionButton
              icon={downloadIcon}
              disable={disableDownload}
              url={downloadSrc ?? src}
              target='_blank'
              rel='noopener noreferrer'
              download
            >
              {t(`${I18N_PATH}Download`)}
            </ModalActionButton>

            {showSendEmail && (
              <ModalActionButton
                icon={emailIcon}
                disable={disableSendEmail}
                url={`mailto:%20?body=${downloadSrc ?? src}`}
              >
                {t(`${I18N_PATH}SendToEmail`)}
              </ModalActionButton>
            )}
          </Layouts.Flex>
        </Layouts.Flex>
      </Layouts.Margin>
    </>
  );
};
