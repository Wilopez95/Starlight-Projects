import React from 'react';
import cx from 'classnames';

import { Modal } from '@root/common';
import JobSiteForm from '@root/components/forms/JobSite/JobSite';
import { IJobSiteData } from '@root/components/forms/JobSite/types';

import { IJobSiteModal } from './types';

import styles from './css/styles.scss';

const JobSiteModal: React.FC<IJobSiteModal<IJobSiteData>> = ({
  isOpen,
  overlayClassName,
  withMap,
  isEditing,
  nonSearchable,
  jobSite,
  onClose,
  onFormSubmit,
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      className={cx(styles.modal, { [styles.withMap]: withMap })}
      overlayClassName={cx(styles.overlay, overlayClassName)}
    >
      <JobSiteForm
        withMap={withMap}
        isEditing={isEditing}
        nonSearchable={nonSearchable}
        jobSite={jobSite}
        onSubmit={onFormSubmit}
        onClose={onClose}
      />
    </Modal>
  );
};

export default JobSiteModal;
