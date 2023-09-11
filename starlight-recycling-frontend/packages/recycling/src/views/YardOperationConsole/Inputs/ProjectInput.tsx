import React, { FC, useCallback, useEffect, useMemo } from 'react';
import gql from 'graphql-tag';
import { find } from 'lodash/fp';
import { useField } from 'react-final-form';
import { SelectOption, useOpenFormWithCloseConfirmation } from '@starlightpro/common';
import { Trans, useTranslation } from '../../../i18n';

import { useGetHaulingProjectsAllLazyQuery } from '../../../graphql/api';
import { ReadOnlyOrderFormComponent } from '../types';
import { NewProjectForm } from '../../../components/ProjectForm';
import { CustomerJobSiteOption } from './JobSiteInput';
import { SearchFieldWithNewEntity } from '../../../components/FinalForm/SearchField';

interface ProjectInputProps extends ReadOnlyOrderFormComponent {
  allowCreateNew?: boolean;
  onChange?: (id: number) => void;
}

export type ProjectOption = {
  label: string;
  value: string;
  id: number;
  poRequired: boolean;
  __typename: string;
};

gql`
  query getHaulingProjectsAll($filter: HaulingProjectFilter!) {
    haulingProjects(filter: $filter) {
      id
      description
      poRequired
    }
  }

  query getHaulingCustomerJobSitePair($filter: HaulingCustomerJobSitePairFilterInput!) {
    haulingCustomerJobSitePair(filter: $filter) {
      id
      poRequired
      popupNote
    }
  }
`;

export const ProjectInput: FC<ProjectInputProps> = ({
  readOnly,
  allowCreateNew = true,
  onChange,
}) => {
  const [t] = useTranslation();
  const { input } = useField('project', { subscription: { value: true } });
  const { input: customerJobSiteInput } = useField<CustomerJobSiteOption['jobSite']>(
    'customerJobSite',
    {
      subscription: { value: true },
    },
  );

  const customerJobSiteId = customerJobSiteInput.value?.id;
  const [
    getHaulingCustomerJobSiteProjects,
    { data: projectsData },
  ] = useGetHaulingProjectsAllLazyQuery({ fetchPolicy: 'no-cache' });

  useEffect(() => {
    if (customerJobSiteId) {
      getHaulingCustomerJobSiteProjects({ variables: { filter: { customerJobSiteId } } });
    }
  }, [customerJobSiteId, getHaulingCustomerJobSiteProjects]);

  const options = useMemo(
    () =>
      projectsData?.haulingProjects.map((project) => ({
        label: project.description,
        value: project.description,
        id: project.id,
        poRequired: project.poRequired,
        __typename: project.__typename,
      })) as ProjectOption[],
    [projectsData],
  );

  const [openForm] = useOpenFormWithCloseConfirmation({ modal: true });

  const openCreateNewProjectModal = useCallback(() => {
    if (!customerJobSiteId) {
      return null;
    }

    openForm({
      form: (
        <NewProjectForm
          customerJobSiteId={customerJobSiteId}
          jobSitePORequired={!!customerJobSiteInput.value?.poRequired}
          onSubmitted={async (project) => {
            await getHaulingCustomerJobSiteProjects({
              variables: { filter: { customerJobSiteId } },
            });
            input.onChange({ target: { name: 'project', value: project } });
          }}
        />
      ),
    });
  }, [customerJobSiteId, getHaulingCustomerJobSiteProjects, input, openForm, customerJobSiteInput]);

  return (
    <SearchFieldWithNewEntity
      options={options}
      name="project"
      disabled={readOnly || !customerJobSiteId}
      label={<Trans>Project ID</Trans>}
      onChange={(value) => {
        input.onChange({ target: { name: 'project', value: value, id: value } });

        if (onChange) {
          onChange(value);
        }
      }}
      renderOption={(option) => (
        <SelectOption disabled={option.disabled} value={option.value} data-cy={option.label}>
          {option.label}
        </SelectOption>
      )}
      mapValues={{
        mapFieldValueToFormValue(value) {
          return find({ id: value?.id }, projectsData?.haulingProjects);
        },
        mapFormValueToFieldValue(value) {
          return value?.description || '';
        },
      }}
      onCreate={openCreateNewProjectModal}
      newEntityName={allowCreateNew ? t('project') : undefined}
    />
  );
};
