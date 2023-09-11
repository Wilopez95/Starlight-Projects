import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@starlightpro/shared-components';
import cx from 'classnames';

import { IButtonContainer } from './types';

import styles from './css/styles.scss';

const I18N_PATH = 'pages.SystemConfiguration.components.ButtonContainer.Text.';

export const ButtonContainer: React.FC<IButtonContainer> = ({
  isCreating,
  customCreateActions,
  customEditActions,
  isDuplicating,
  submitButtonText,
  onDuplicate,
  onSave,
  onCancel,
  onDelete,
  submitButtonType = 'submit',
  disabled = false,
}) => {
  const { t } = useTranslation();

  return (
    <div className={styles.buttonContainer}>
      {isCreating || isDuplicating ? (
        <>
          <Button onClick={onCancel}>Cancel</Button>
          <div>
            {customCreateActions?.map(action => (
              <Button
                key={action.buttonText}
                onClick={action.handler}
                className={styles.spaceRight}
              >
                {action.buttonText}
              </Button>
            ))}
            <Button type="button" variant="success" onClick={onSave} disabled={disabled}>
              {submitButtonText
                ? t(`${I18N_PATH}CreateNewP`, {
                    submitButtonText,
                  })
                : t(`${I18N_PATH}CreateNew`)}
            </Button>
          </div>
        </>
      ) : (
        <>
          <div>
            {onDelete ? (
              <Button
                variant="converseAlert"
                onClick={onDelete}
                disabled={disabled}
                className={cx(styles.deleteButton, {
                  [styles.spaceLeft]: isCreating ?? isDuplicating,
                })}
              >
                {t(`Text.Delete`)}
              </Button>
            ) : (
              <Button onClick={onCancel}>Cancel</Button>
            )}
          </div>
          <div>
            {onDuplicate ? (
              <Button onClick={onDuplicate} className={styles.spaceRight}>
                {t(`${I18N_PATH}Duplicate`)}
              </Button>
            ) : null}
            {customEditActions?.map(action => (
              <Button
                key={action.buttonText}
                onClick={action.handler}
                className={styles.spaceRight}
              >
                {action.buttonText}
              </Button>
            ))}
            {onSave ? (
              <Button
                type={submitButtonType}
                variant="primary"
                onClick={submitButtonType === 'button' ? onSave : undefined}
                className={onDuplicate ? styles.flexEnd : undefined}
                disabled={disabled}
              >
                {t(`Text.SaveChanges`)}
              </Button>
            ) : null}
          </div>
        </>
      )}
    </div>
  );
};
