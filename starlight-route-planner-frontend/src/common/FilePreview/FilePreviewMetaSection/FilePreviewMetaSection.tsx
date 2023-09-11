import React from 'react';
import { DeleteIcon, Layouts, Typography } from '@starlightpro/shared-components';
import { format, utcToZonedTime } from 'date-fns-tz';

import { DateFormat } from '@root/consts';
import { useTimeZone } from '@root/hooks';

import { IFilePreviewMetaSection } from './types';

import styles from './css/styles.scss';

export const MetaSection: React.FC<IFilePreviewMetaSection> = ({
  fileName,
  timestamp,
  downloadSrc,
  author = 'unknown',
  src = '',
  hideAuthor = false,
  onRemove,
}) => {
  const { timeZone } = useTimeZone();

  return (
    <>
      <Typography variant="headerThree">{fileName}</Typography>
      {!hideAuthor && (
        <Layouts.Margin top="1" bottom="1">
          <Typography variant="bodyMedium" className={styles.author}>
            Attached by {author}
          </Typography>
        </Layouts.Margin>
      )}
      <Layouts.Margin bottom="3">
        <Layouts.Flex alignItems="center" justifyContent="space-between">
          {timestamp ? (
            <time
              dateTime={format(utcToZonedTime(timestamp, timeZone), DateFormat.DateTime, {
                timeZone,
              })}
            >
              <Typography variant="bodyMedium" as="span">
                {' '}
                {format(utcToZonedTime(timestamp, timeZone), DateFormat.Time, {
                  timeZone,
                })}
              </Typography>
              ・
              <Typography variant="bodyMedium" color="secondary" as="span">
                {format(utcToZonedTime(timestamp, timeZone), DateFormat.Date, {
                  timeZone,
                })}
              </Typography>
            </time>
          ) : (
            <Typography variant="bodyMedium" color="secondary">
              Time unknown
            </Typography>
          )}
          <Layouts.Flex>
            {onRemove && (
              <Layouts.Margin right="4">
                <Layouts.Flex alignItems="center" onClick={() => onRemove()}>
                  <Layouts.IconLayout remove>
                    <DeleteIcon />
                  </Layouts.IconLayout>
                  <Typography variant="bodyMedium" cursor="pointer" color="information" as="span">
                    Remove
                  </Typography>
                </Layouts.Flex>
              </Layouts.Margin>
            )}
            <Layouts.Flex alignItems="center">
              <a
                className={`${styles.modalAction} ${styles.download}`}
                download
                href={downloadSrc ?? src}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Typography variant="bodyMedium" cursor="pointer" color="information" as="span">
                  Download
                </Typography>
              </a>
            </Layouts.Flex>

            <Layouts.Flex alignItems="center">
              <a className={styles.modalAction} href={`mailto:%20?body=${downloadSrc ?? src}`}>
                <Typography variant="bodyMedium" cursor="pointer" color="information" as="span">
                  Send to email
                </Typography>
              </a>
            </Layouts.Flex>
          </Layouts.Flex>
        </Layouts.Flex>
      </Layouts.Margin>
    </>
  );
};
