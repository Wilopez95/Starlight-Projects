import React, { useCallback, useMemo } from 'react';
import { Autocomplete, Button, Layouts } from '@starlightpro/shared-components';
import { useFormik } from 'formik';
import { observer } from 'mobx-react-lite';

import { GlobalService } from '@root/api';
import { AutocompleteTemplates, Typography } from '@root/common';
import { Divider } from '@root/common/TableTools';
import JobSiteModal from '@root/components/modals/JobSite/JobSite';
import { addressFormat, handleEnterOrSpaceKeyDown } from '@root/helpers';
import { useBusinessContext, useStores, useToggle } from '@root/hooks';
import { AddressSuggestion } from '@root/types/responseEntities';

import { type IJobSiteData } from '../JobSite/types';
import { FormContainerLayout } from '../layout/FormContainer';

import { defaultValue, validationSchema } from './formikData';
import { type ILinkJobSiteForm } from './types';

import formStyles from './css/styles.scss';

const LinkJobSiteForm: React.FC<ILinkJobSiteForm> = ({ onClose, onJobSiteCreated, onSubmit }) => {
  const { jobSiteStore, customerStore, i18nStore } = useStores();
  const [isJobSiteModalOpen, toggleJobSiteModal] = useToggle();
  const { businessUnitId } = useBusinessContext();

  const selectedCustomer = customerStore.selectedEntity;

  const formik = useFormik({
    initialValues: defaultValue,
    validationSchema,
    validateOnChange: false,
    onSubmit,
    onReset: onClose,
  });

  const { values, errors, setValues } = formik;

  const handleAutocompleteRequest = useCallback(
    async (searchValue: string) => {
      const { jobSites } = await GlobalService.multiSearch(searchValue, businessUnitId);
      const jobSiteValues = jobSiteStore.values;

      return jobSites.filter(
        jobSiteSuggestion => !jobSiteValues.some(jobSite => jobSite.id === +jobSiteSuggestion.id),
      );
    },
    [businessUnitId, jobSiteStore],
  );

  const handleAutocompleteChange = useCallback(
    (_: string, value: string) => {
      setValues({
        ...values,
        searchString: value,
        jobSiteId: undefined,
      });
    },
    [setValues, values],
  );

  const handleJobSiteSelect = useCallback(
    (item: AddressSuggestion) => {
      setValues({
        ...values,
        jobSiteId: item.id,
        searchString: addressFormat({
          ...item,
          addressLine1: item.address,
          addressLine2: '',
          region: i18nStore.region,
        }),
      });
    },
    [i18nStore.region, setValues, values],
  );

  const handleJobSiteSubmit = useCallback(
    async (jobSiteData: IJobSiteData) => {
      if (!selectedCustomer) {
        return;
      }

      const maybeCreatedJobSite = await jobSiteStore.create({
        data: jobSiteData,
        linkTo: selectedCustomer.id,
      });

      toggleJobSiteModal();
      onClose();

      if (maybeCreatedJobSite) {
        onJobSiteCreated(maybeCreatedJobSite);
      }
    },
    [jobSiteStore, onClose, onJobSiteCreated, selectedCustomer, toggleJobSiteModal],
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLOrSVGElement>) => {
      if (handleEnterOrSpaceKeyDown(e)) {
        toggleJobSiteModal();
      }
    },
    [toggleJobSiteModal],
  );

  const jobsiteAutocompleteConfigs = useMemo(() => {
    return [
      {
        name: 'jobSites',
        onSelect: handleJobSiteSelect,
        template: <AutocompleteTemplates.JobSite />,
      },
    ];
  }, [handleJobSiteSelect]);

  return (
    <>
      <JobSiteModal
        isOpen={isJobSiteModalOpen}
        onClose={toggleJobSiteModal}
        onFormSubmit={handleJobSiteSubmit}
        overlayClassName={formStyles.jobSiteOverlay}
        withMap
      />
      <FormContainerLayout formik={formik}>
        <Layouts.Flex direction="column">
          <Layouts.Padding top="3" right="5" left="5">
            <Typography variant="headerThree">Link Job Site</Typography>
          </Layouts.Padding>
          <Layouts.Flex direction="column" flexGrow={1} justifyContent="space-around">
            <Layouts.Padding left="5" right="5">
              <div className={formStyles.autocompleteContainer}>
                <Autocomplete
                  name="searchString"
                  placeholder="Enter Address"
                  ariaLabel="Enter Address"
                  search={values.searchString}
                  onSearchChange={handleAutocompleteChange}
                  onRequest={handleAutocompleteRequest}
                  configs={jobsiteAutocompleteConfigs}
                  error={errors?.jobSiteId}
                />
              </div>
              <Layouts.Margin top="4">
                <Typography
                  color="information"
                  variant="bodyMedium"
                  cursor="pointer"
                  role="button"
                  tabIndex={0}
                  onKeyDown={handleKeyDown}
                  onClick={toggleJobSiteModal}
                >
                  <Layouts.Flex alignItems="center">
                    <Layouts.Padding right="1">+</Layouts.Padding>
                    Create New Job Site
                  </Layouts.Flex>
                </Typography>
              </Layouts.Margin>
            </Layouts.Padding>
          </Layouts.Flex>
          <Divider />
          <Layouts.Padding padding="4" left="5" right="5">
            <Layouts.Flex justifyContent="space-between">
              <Button type="reset">Cancel</Button>
              <Button type="submit" disabled={!values.jobSiteId} variant="primary">
                Add Job Site
              </Button>
            </Layouts.Flex>
          </Layouts.Padding>
        </Layouts.Flex>
      </FormContainerLayout>
    </>
  );
};

export default observer(LinkJobSiteForm);
