import React, { FC } from 'react';
import { ProjectForm } from './ProjectForm';
import { closeModal } from '../Modals';
import { initialValues } from './NewProjectForm';
interface Props {
  projectId: number;
  customerJobSiteId: number;
  onSubmitted?(): void;
}
// ToDo add update project
export const EditProjectForm: FC<Props> = ({ onSubmitted }) => {
  return (
    <ProjectForm
      initialValues={initialValues}
      onCancel={closeModal}
      onSubmit={async () => {}}
      onSubmitted={onSubmitted}
    />
  );
};
