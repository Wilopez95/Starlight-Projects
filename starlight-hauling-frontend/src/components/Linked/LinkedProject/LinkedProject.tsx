import React, { useCallback } from 'react';
import { useHistory } from 'react-router-dom';
import cx from 'classnames';
import { observer } from 'mobx-react-lite';

import { ProjectIcon } from '@root/assets';
import { Project } from '@root/stores/entities';

import { LinkedEntity } from '../types';

import styles from '../css/styles.scss';

const LinkedProject: React.FC<LinkedEntity<Project>> = ({ entity, onClick, to, className }) => {
  const history = useHistory();

  const handleClick = useCallback(() => {
    if (to) {
      history.push(to);
    } else {
      onClick?.(entity);
    }
  }, [entity, history, onClick, to]);

  return (
    <div onClick={handleClick} className={cx(styles.linkedItem, className)}>
      <ProjectIcon className={styles.icon} />
      <div className={styles.textContainer}>
        <div className={styles.title}>{entity.description}</div>
        <div className={styles.subTitle}>ID - {entity.id}</div>
      </div>
    </div>
  );
};

export default observer(LinkedProject);
