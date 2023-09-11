import React from 'react';
import cx from 'classnames';

import { Modal } from '@root/common';
import { ProjectForm } from '@root/components/forms';

import { IProjectModal } from './types';

import styles from './css/styles.scss';

const ProjectModal: React.FC<IProjectModal> = ({
  locked,
  isOpen,
  project,
  linkedData,
  className,
  overlayClassName,
  onClose,
  onFormSubmit,
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      className={cx(styles.modal, className)}
      overlayClassName={cx(styles.overlay, overlayClassName)}
    >
      <ProjectForm
        onSubmit={onFormSubmit}
        onClose={onClose}
        project={project}
        linkedData={linkedData}
        locked={locked}
      />
    </Modal>
  );
};

export default ProjectModal;
