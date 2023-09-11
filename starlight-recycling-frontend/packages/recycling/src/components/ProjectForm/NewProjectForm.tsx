import React, { FC } from 'react';
import { Trans } from '../../i18n';
import { gql } from '@apollo/client';

import { ProjectForm } from './ProjectForm';
import { showError, showSuccess } from '../Toast';
import { CreateHaulingProjectMutation, useCreateHaulingProjectMutation } from '../../graphql/api';
import { closeModal } from '../Modals';

export const initialValues = {
  description: '',
  purchaseOrder: false,
};

interface NewProjectFormProps {
  customerJobSiteId: number;
  jobSitePORequired?: boolean;
  onSubmitted?: (projectId?: CreateHaulingProjectMutation['createHaulingProject']) => void;
}

gql`
  mutation CreateHaulingProject($data: ProjectInput!) {
    createHaulingProject(input: $data) {
      id
      description
      startDate
      endDate
      poRequired
    }
  }
`;

export const NewProjectForm: FC<NewProjectFormProps> = ({
  customerJobSiteId,
  jobSitePORequired,
  onSubmitted,
}) => {
  const [createHaulingProject] = useCreateHaulingProjectMutation();

  const handleSubmit = async (values: any) => {
    try {
      const newProject = await createHaulingProject({
        variables: {
          data: { ...values, customerJobSiteId },
        },
      });
      showSuccess(<Trans>Project created successfully.</Trans>);

      return {
        ...newProject?.data?.createHaulingProject,
        purchaseOrder: newProject?.data?.createHaulingProject?.poRequired,
      };
    } catch (e) {
      showError(<Trans>Can't be saved. Project with such description already exists</Trans>);
    }
  };

  return (
    <ProjectForm
      create
      initialValues={{
        ...initialValues,
        purchaseOrder: jobSitePORequired,
      }}
      jobSitePORequired={jobSitePORequired}
      onCancel={closeModal}
      onSubmit={handleSubmit}
      onSubmitted={onSubmitted}
    />
  );
};
