import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, ISelectOption, Layouts, Select } from '@starlightpro/shared-components';
import { useFormikContext } from 'formik';
import { observer } from 'mobx-react-lite';

import { DeleteIcon } from '@root/assets';
import { Modal, Typography } from '@root/common';
import { IModal } from '@root/common/Modal/types';
import { Divider } from '@root/common/TableTools';
import { handleEnterOrSpaceKeyDown } from '@root/helpers';
import { useStores } from '@root/hooks';
import { IConfigurableOrder } from '@root/types';

import styles from './css/styles.scss';

const I18N_PATH = 'quickViews.components.OrderQuickViewLeftPanel.ChangeProjectModal.Text.';

const ChangeProjectModal: React.FC<IModal> = ({ onClose, isOpen }) => {
  const { projectStore } = useStores();
  const { values, setFieldValue } = useFormikContext<IConfigurableOrder>();

  const [projectId, setProjectId] = useState(values.projectId);

  const { t } = useTranslation();

  useEffect(() => {
    setProjectId(values.projectId);
  }, [values.projectId]);

  const handleSubmit = useCallback(() => {
    setFieldValue('projectId', projectId);
    onClose?.();
  }, [onClose, projectId, setFieldValue]);

  const handleChangeProject = useCallback((_: string, value: number) => {
    setProjectId(value);
  }, []);

  const projectOptions: ISelectOption[] = projectStore.values.map(project => ({
    value: project.id,
    label: project.description,
  }));

  return (
    <Modal
      isOpen={isOpen}
      className={styles.modal}
      overlayClassName={styles.overlay}
      onClose={onClose}
    >
      <Layouts.Flex direction="column">
        <Layouts.Padding top="3" right="5" left="5">
          <Typography variant="headerThree">{t(`${I18N_PATH}ChangeProject`)}</Typography>
        </Layouts.Padding>
        <Layouts.Flex direction="column" flexGrow={1} justifyContent="space-around">
          <Layouts.Padding padding="5">
            {projectId ? (
              <Layouts.Flex alignItems="center">
                <Layouts.Margin right="1">
                  <DeleteIcon
                    role="button"
                    tabIndex={0}
                    aria-label={t('Text.Remove')}
                    className={styles.removeIcon}
                    onClick={() => setProjectId(null)}
                    onKeyDown={e => {
                      if (handleEnterOrSpaceKeyDown(e)) {
                        setProjectId(null);
                      }
                    }}
                  />
                </Layouts.Margin>
                <Typography variant="bodyMedium">
                  {projectStore.getById(projectId)?.description}
                </Typography>
              </Layouts.Flex>
            ) : (
              <div className={styles.select}>
                <Select
                  placeholder="Select project"
                  label="Project"
                  name="projectId"
                  onSelectChange={handleChangeProject}
                  options={projectOptions}
                  value={projectId ?? undefined}
                />
              </div>
            )}
          </Layouts.Padding>
        </Layouts.Flex>
        <Divider />
        <Layouts.Padding padding="4" left="5" right="5">
          <Layouts.Flex justifyContent="space-between">
            <Button onClick={onClose}>Cancel</Button>
            <Button onClick={handleSubmit} variant="primary">
              {t(`Text.SaveChanges`)}
            </Button>
          </Layouts.Flex>
        </Layouts.Padding>
      </Layouts.Flex>
    </Modal>
  );
};

export default observer(ChangeProjectModal);
