import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import cx from 'classnames';
import { observer } from 'mobx-react-lite';

import { ProjectIcon, ToolsIcon } from '@root/assets';
import { useStores } from '@root/hooks';
import { Project } from '@root/stores/entities';
import { IProject } from '@root/types';

import styles from '../../css/styles.scss';
import { IProjectFilter, IProjectFilterItem } from './types';

const ProjectFilterItem: React.FC<IProjectFilterItem> = ({
  title,
  project,
  selected,
  onClick,
  onConfigClick,
}) => {
  const handleSelect = useCallback(() => {
    onClick(project!);
  }, [onClick, project]);

  const handleConfig = useCallback(
    (e: React.MouseEvent<HTMLOrSVGElement>) => {
      e.stopPropagation();
      onConfigClick?.(project!);
    },
    [onConfigClick, project],
  );

  return project || title ? (
    <div
      className={cx(styles.projectFilterItem, { [styles.selected]: selected })}
      onClick={handleSelect}
    >
      <div className={styles.title}>{title ?? project?.description}</div>
      {onConfigClick && project ? (
        <>
          <div className={styles.divider} />
          <div className={styles.config}>
            <ToolsIcon onClick={handleConfig} />
          </div>
        </>
      ) : null}
    </div>
  ) : null;
};

const ProjectFilter: React.FC<IProjectFilter> = ({ setProject, selectedProjectId }) => {
  const { projectStore } = useStores();
  const { t } = useTranslation();

  const projects = projectStore.values;

  const handleSelectAllProject = useCallback(() => {
    setProject(undefined);
  }, [setProject]);

  const handleSelectProject = useCallback(
    (project: IProject) => {
      setProject(project.id === selectedProjectId ? undefined : project.id);
    },
    [selectedProjectId, setProject],
  );

  const handleProjectConfig = useCallback(
    (project: Project) => {
      projectStore.selectEntity(project);
    },
    [projectStore],
  );

  return (
    <div className={styles.projectFilterWrapper}>
      <span>
        <ProjectIcon className={styles.filterIcon} />
      </span>
      <div className={styles.projectFilter}>
        <ProjectFilterItem
          title={t(
            'components.PageLayouts.CustomerJobSiteLayout.components.ProjectFilter.Text.AllOrders',
          )}
          onClick={handleSelectAllProject}
          selected={selectedProjectId === undefined}
        />
        {projects.map(project => (
          <ProjectFilterItem
            key={project.generatedId}
            selected={selectedProjectId === project.id}
            project={project}
            onConfigClick={handleProjectConfig}
            onClick={handleSelectProject}
          />
        ))}
      </div>
    </div>
  );
};

export default observer(ProjectFilter);
