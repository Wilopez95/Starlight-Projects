import React, { useCallback, useContext, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Checkbox, Layouts } from '@starlightpro/shared-components';
import { FieldArray, useFormikContext } from 'formik';
import { noop } from 'lodash-es';
import { observer } from 'mobx-react-lite';
import { ThemeContext } from 'styled-components';

import { Typography } from '@root/common';
import { Table, TableBody, TableCell, TableRow, TableTools } from '@root/common/TableTools';
import { ConfirmModal, SelectTaxDistrictModal } from '@root/components/modals';
import { handleEnterOrSpaceKeyDown, NotificationHelper } from '@root/helpers';
import { ActionCode } from '@root/helpers/notifications/types';
import { useBoolean, useCrudPermissions, useStores } from '@root/hooks';
import { TaxDistrictType } from '@root/types';

import { IJobSiteSettings } from './formikData';
import { DeleteTaxDistrictIcon } from './styles';

const I18N_PATH = 'pages.JobSites.components.JobSiteQuickView.Tabs.TaxDistrictsList.';
const TAX_DISTRICT_TYPES_PATH =
  'pages.SystemConfiguration.tables.TaxDistricts.Text.LocalDistrictTypes.';

const TaxDistrictsList = () => {
  const { t } = useTranslation();

  const { values } = useFormikContext<IJobSiteSettings>();
  const { taxDistrictStore, jobSiteStore, i18nStore } = useStores();

  const loading = taxDistrictStore.loading || jobSiteStore.loading;
  const { colors } = useContext(ThemeContext);

  const [isAssignDistrictModalOpen, openAssignDistrictModal, closeAssignDistrictModal] =
    useBoolean();
  const [isConfirmModalOpen, openConfirmModal, closeConfirmModal] = useBoolean();
  const [districtToRemove, setDistrictToRemove] = useState<undefined | number>();

  const handleDeleteClick = useCallback(
    (index: number) => {
      setDistrictToRemove(index);
      openConfirmModal();
    },
    [openConfirmModal],
  );

  const handleDeleteKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLOrSVGElement>, index: number) => {
      if (handleEnterOrSpaceKeyDown(e)) {
        handleDeleteClick(index);
      }
    },
    [handleDeleteClick],
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLOrSVGElement>) => {
      if (handleEnterOrSpaceKeyDown(e)) {
        openAssignDistrictModal();
      }
    },
    [openAssignDistrictModal],
  );

  const [canViewTaxDistricts] = useCrudPermissions('configuration', 'tax-districts');

  useEffect(() => {
    if (!canViewTaxDistricts) {
      NotificationHelper.error('default', ActionCode.ACCESS_DENIED);
    }
  }, [canViewTaxDistricts]);

  if (!canViewTaxDistricts) {
    return null;
  }

  return (
    <Layouts.Flex direction="column">
      <FieldArray name="taxDistrictIds">
        {({ push, remove }) => (
          <>
            <ConfirmModal
              title="Remove Tax District"
              subTitle="Are you sure you want to remove this tax district from job site?"
              cancelButton="Cancel"
              submitButton="Remove Tax District"
              isOpen={isConfirmModalOpen}
              onCancel={closeConfirmModal}
              onSubmit={() => {
                if (districtToRemove !== undefined) {
                  remove(districtToRemove);
                  setDistrictToRemove(undefined);
                }
                closeConfirmModal();
              }}
            />
            <SelectTaxDistrictModal
              excludeIds={values.taxDistrictIds}
              isOpen={isAssignDistrictModalOpen}
              onClose={closeAssignDistrictModal}
              onFormSubmit={id => {
                push(id);
                closeAssignDistrictModal();
              }}
            />
            <Table>
              <TableTools.Header>
                <TableTools.HeaderCell minWidth={40}>
                  {t(`${I18N_PATH}Columns.Description`)}
                </TableTools.HeaderCell>
                <TableTools.HeaderCell minWidth={30}>
                  {t(`${I18N_PATH}Columns.Type`)}
                </TableTools.HeaderCell>
                <TableTools.HeaderCell center>
                  {t(`${I18N_PATH}Columns.MapCode`)}
                </TableTools.HeaderCell>
              </TableTools.Header>
              <TableBody cells={3} loading={loading}>
                {loading
                  ? null
                  : values.taxDistrictIds.map((id, index) => {
                      const district = taxDistrictStore.getById(id);

                      if (!district) {
                        return null;
                      }

                      return (
                        <TableRow key={id}>
                          <TableCell>
                            <DeleteTaxDistrictIcon
                              role="button"
                              tabIndex={0}
                              aria-label={`${t('Text.Remove')} ${district.description}`}
                              fill={colors.grey.standard}
                              onClick={() => handleDeleteClick(index)}
                              onKeyDown={e => handleDeleteKeyDown(e, index)}
                            />
                            {district.description}
                          </TableCell>
                          <TableCell>
                            {t(
                              `${TAX_DISTRICT_TYPES_PATH}${i18nStore.region}.${district.districtType}`,
                            )}
                          </TableCell>
                          <TableCell center>
                            <Checkbox
                              name="hasMapCode"
                              value={
                                !!district.districtCode ||
                                district.districtType === TaxDistrictType.Country
                              }
                              disabled
                              onChange={noop}
                            />
                          </TableCell>
                        </TableRow>
                      );
                    })}
              </TableBody>
            </Table>
            <Layouts.Margin top="4" left="2">
              <Layouts.Flex alignItems="center" justifyContent="space-between">
                <Typography
                  color="information"
                  variant="bodyMedium"
                  cursor="pointer"
                  role="button"
                  tabIndex={0}
                  onKeyDown={handleKeyDown}
                  onClick={openAssignDistrictModal}
                >
                  + {t(`${I18N_PATH}Text.AssignDistrict`)}
                </Typography>
              </Layouts.Flex>
            </Layouts.Margin>
          </>
        )}
      </FieldArray>
    </Layouts.Flex>
  );
};

export default observer(TaxDistrictsList);
