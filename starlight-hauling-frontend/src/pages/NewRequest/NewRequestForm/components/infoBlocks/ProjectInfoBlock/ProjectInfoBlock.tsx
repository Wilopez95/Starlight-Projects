import React from 'react';
import { useTranslation } from 'react-i18next';
import { isAfter, startOfToday } from 'date-fns';
import { observer } from 'mobx-react-lite';

import { CancelAltIcon, ProjectIcon, ToolsIcon } from '@root/assets';
import { Badge } from '@root/common';
import { useStores } from '@root/hooks';
import { useIntl } from '@root/i18n/useIntl';

import InfoBlock from '../InfoBlock';
import { IInfoSemiBlockItem } from '../types';

const I18N_PATH = 'pages.NewRequest.NewRequestForm.components.infoBlocks.ProjectInfoBlock.Text.';

const ProjectInfoBlock: React.FC<IInfoSemiBlockItem> = ({
  onClear,
  onConfigure,
  onRemove,
  projectId,
}) => {
  const { projectStore } = useStores();
  const { formatDateTime } = useIntl();
  const { t } = useTranslation();

  const selectedProject = projectId ? projectStore.getById(projectId) : projectStore.selectedEntity;

  const isExpired = selectedProject?.endDate && isAfter(startOfToday(), selectedProject.endDate);

  const getLines = () => {
    const lines = [];

    if (selectedProject?.startDate && selectedProject.endDate) {
      lines.push(
        `${formatDateTime(selectedProject.startDate).date} - ${
          formatDateTime(selectedProject.endDate).date
        }`,
      );
    } else if (selectedProject?.startDate) {
      lines.push(
        `${t(`${I18N_PATH}StartsOn`, {
          date: formatDateTime(selectedProject.startDate).date,
        })}`,
      );
    } else if (selectedProject?.endDate) {
      lines.push(
        `${t(`${I18N_PATH}EndsOn`, {
          date: formatDateTime(selectedProject.endDate).date,
        })}`,
      );
    }

    return lines;
  };

  return (
    <InfoBlock
      firstBlock={{
        heading: (
          <>
            {t(`${I18N_PATH}ProjectId`, { id: selectedProject?.id })}
            {isExpired ? (
              <Badge borderRadius={2} color="primary">
                {t('Text.Expired')}
              </Badge>
            ) : null}
          </>
        ),
        headingId: selectedProject?.id,
        title: selectedProject?.description,
        lines: getLines(),
      }}
      secondBlock={{
        emptyBottom: true,
        semi: {
          text: t(`${I18N_PATH}ProjectConfiguration`),
          icon: ToolsIcon,
          onClick: onConfigure,
        },
      }}
      thirdBlock={{
        text: t(`${I18N_PATH}SelectAnotherProject`),
        icon: ProjectIcon,
        onClick: onClear,
        semi: {
          text: t(`${I18N_PATH}RemoveProject`),
          icon: CancelAltIcon,
          onClick: onRemove,
        },
      }}
    />
  );
};

export default observer(ProjectInfoBlock);
