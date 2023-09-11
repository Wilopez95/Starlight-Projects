import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { ISelectOption, Select } from '@starlightpro/shared-components';
import cx from 'classnames';
import { FieldArray, getIn, useFormikContext } from 'formik';
import { noop } from 'lodash-es';

import { handleEnterOrSpaceKeyDown } from '@root/helpers';

import { DeleteIcon, PlusIcon } from '../../../../../../../assets';
import { RadioButton, Typography } from '../../../../../../../common';
import { Divider } from '../../../../../../../common/TableTools';
import { useStores } from '../../../../../../../hooks';
import { type INewCreditCard } from '../../../../types';

import tableQuickViewStyles from '../../../../../../../common/TableTools/TableQuickView/css/styles.scss';
import styles from './css/styles.scss';

const JobSiteAssignment: React.FC<{ viewMode: boolean }> = ({ viewMode }) => {
  const { values, errors, setFieldValue } = useFormikContext<INewCreditCard>();
  const { jobSiteStore } = useStores();
  const { t } = useTranslation();

  const jobSiteOptions: ISelectOption[] = jobSiteStore.values
    .map(jobSite => ({
      label: jobSite.fullAddress,
      value: jobSite.id,
    }))
    .filter(jobSite => !values.jobSites?.includes(jobSite.value));

  const handleChangeAllJobSites = useCallback(() => {
    setFieldValue('jobSites', null);
  }, [setFieldValue]);

  const handleChangeSpecificJobSite = useCallback(() => {
    setFieldValue('jobSites', [undefined]);
  }, [setFieldValue]);

  return (
    <>
      <div className={tableQuickViewStyles.row}>
        <div
          className={cx(
            tableQuickViewStyles.half,
            tableQuickViewStyles.spaceRight,
            tableQuickViewStyles.flex,
          )}
        >
          <Typography color="secondary">Card is valid for</Typography>
          <div className={styles.radioButtonsContainer}>
            <Typography color="secondary" className={styles.radioButton}>
              <RadioButton
                value={values.jobSites === null}
                name="All Job Sites"
                onChange={handleChangeAllJobSites}
                disabled={viewMode}
              >
                All Job Sites
              </RadioButton>
            </Typography>

            <Typography color="secondary">
              <RadioButton
                value={values.jobSites !== null}
                name="Specific Job Site only"
                onChange={handleChangeSpecificJobSite}
                disabled={viewMode}
              >
                Specific Job Site only
              </RadioButton>
            </Typography>
          </div>
        </div>
      </div>
      <Divider both />
      {values.jobSites !== null ? (
        <FieldArray name="jobSites">
          {({ remove, push }) => (
            <>
              {values.jobSites?.map((jobSiteId, index) => (
                <Typography key={jobSiteId} className={styles.textWithIcon}>
                  <DeleteIcon
                    role="button"
                    aria-label={t('Text.Delete')}
                    tabIndex={!viewMode ? 0 : -1}
                    className={cx(styles.icon, styles.deleteIcon, !jobSiteId && styles.withControl)}
                    onKeyDown={e => {
                      if (handleEnterOrSpaceKeyDown(e)) {
                        remove(index);
                      }
                    }}
                    onClick={!viewMode ? () => remove(index) : noop}
                  />
                  {jobSiteId ? (
                    jobSiteStore.getById(jobSiteId)?.fullAddress
                  ) : (
                    <Select
                      nonClearable
                      name={`jobSites[${index}]`}
                      options={jobSiteOptions}
                      value={jobSiteId}
                      onSelectChange={setFieldValue}
                      placeholder="Select Job Site"
                      ariaLabel="Select Job Site"
                      error={getIn(errors, `jobSites[${index}]`)}
                    />
                  )}
                </Typography>
              ))}
              {values.jobSites && values.jobSites.length > 1 ? <Divider both /> : null}
              {!values.jobSites?.some(jobSite => !jobSite) ? (
                <Typography
                  className={cx(styles.textWithIcon, styles.assignJobSite)}
                  color="information"
                  onClick={!viewMode ? () => push(undefined) : noop}
                  role="button"
                  tabIndex={0}
                  onKeyDown={e => {
                    if (handleEnterOrSpaceKeyDown(e)) {
                      !viewMode ? () => push(undefined) : noop;
                    }
                  }}
                >
                  <PlusIcon className={styles.icon} /> Assign Job Site
                </Typography>
              ) : null}
            </>
          )}
        </FieldArray>
      ) : null}
    </>
  );
};

export default JobSiteAssignment;
