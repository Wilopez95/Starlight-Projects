import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Checkbox,
  ISelectOption,
  Layouts,
  MultiSelect,
  Select,
} from '@starlightpro/shared-components';
import { useFormikContext } from 'formik';
import { observer } from 'mobx-react-lite';

import { FormInput, Typography } from '@root/common';
import { Divider } from '@root/common/TableTools';
import { useStores } from '@root/hooks';
import { buildI18Path } from '@root/i18n/helpers';
import { ITrucksFormikData } from '@root/types';

const I18N_PATH = buildI18Path('pages.SystemConfiguration.tables.TruckTypes.');

const TruckQuickViewRightPanel: React.FC = () => {
  const { values, errors, setFieldValue, handleChange } = useFormikContext<ITrucksFormikData>();
  const { t } = useTranslation();
  const { businessUnitStore, truckTypeStore, truckStore, systemConfigurationStore } = useStores();
  const selectedTruck = truckStore.selectedEntity;
  const isCreating = systemConfigurationStore.isCreating;
  const isNew = !selectedTruck || isCreating;

  const businessUnitOptions: ISelectOption[] = useMemo(
    () =>
      businessUnitStore.values.map(elem => ({
        value: elem.id,
        label: elem.nameLine1,
      })),
    [businessUnitStore.values],
  );

  const truckTypeOptions: ISelectOption[] = useMemo(
    () =>
      truckTypeStore.values.map(elem => ({
        value: elem.id,
        label: elem.description,
      })),
    [truckTypeStore.values],
  );

  return (
    <Layouts.Scroll>
      <Layouts.Padding padding="3">
        <Typography variant="headerThree">
          {isNew ? t(`${I18N_PATH.Text}NewTruck`) : selectedTruck?.description}
        </Typography>

        <Typography variant="caption" textTransform="uppercase">
          {t(`${I18N_PATH.Text}Truck`)}
        </Typography>
        <Divider both />
        <Layouts.Margin bottom="2">
          <Layouts.Flex>
            <Layouts.Column>
              <Typography color="secondary" shade="desaturated">
                {t('Text.Status')}
              </Typography>
            </Layouts.Column>
            <Layouts.Column>
              <Layouts.Margin right="3">
                <Checkbox
                  id="activeCheckbox"
                  name="active"
                  value={values.active}
                  onChange={handleChange}
                >
                  {t('Text.Active')}
                </Checkbox>
              </Layouts.Margin>
            </Layouts.Column>
          </Layouts.Flex>
        </Layouts.Margin>

        <Layouts.Flex>
          <Layouts.Column>
            <Layouts.Margin top="1">
              <Typography color="secondary" as="label" htmlFor="description" shade="desaturated">
                {t('Text.Description')}*
              </Typography>
            </Layouts.Margin>
          </Layouts.Column>
          <Layouts.Column>
            <FormInput
              name="description"
              onChange={handleChange}
              value={values.description}
              error={errors.description}
            />
          </Layouts.Column>
        </Layouts.Flex>
        <Layouts.Flex>
          <Layouts.Column>
            <Layouts.Margin top="1">
              <Typography color="secondary" as="label" htmlFor="truckTypeId" shade="desaturated">
                {t(`${I18N_PATH.Text}TruckType`)}*
              </Typography>
            </Layouts.Margin>
          </Layouts.Column>
          <Layouts.Column>
            <Select
              name="truckTypeId"
              options={truckTypeOptions}
              value={values.truckTypeId}
              error={errors.truckTypeId}
              onSelectChange={setFieldValue}
              nonClearable
            />
          </Layouts.Column>
        </Layouts.Flex>
        <Layouts.Flex>
          <Layouts.Column>
            <Layouts.Margin top="1">
              <Typography color="secondary" as="label" htmlFor="note" shade="desaturated">
                {t(`${I18N_PATH.Text}TruckNotes`)}
              </Typography>
            </Layouts.Margin>
          </Layouts.Column>
          <Layouts.Column>
            <FormInput
              area
              name="note"
              onChange={handleChange}
              value={values.note}
              error={errors.note}
            />
          </Layouts.Column>
        </Layouts.Flex>
        <Layouts.Flex>
          <Layouts.Column>
            <Layouts.Margin top="1">
              <Typography color="secondary" as="label" htmlFor="licensePlate" shade="desaturated">
                {t(`${I18N_PATH.Text}LicensePlate`)}*
              </Typography>
            </Layouts.Margin>
          </Layouts.Column>
          <Layouts.Column>
            <FormInput
              name="licensePlate"
              onChange={handleChange}
              value={values.licensePlate}
              error={errors.licensePlate}
            />
          </Layouts.Column>
        </Layouts.Flex>
        <Divider />
        <Layouts.Margin top="2" bottom="3">
          <Layouts.Flex>
            <MultiSelect
              name="businessUnitIds"
              label={`${t(`${I18N_PATH.Text}BusinessUnits`)}*`}
              ariaLabel={t(`${I18N_PATH.Text}BusinessUnits`)}
              onSelectChange={setFieldValue}
              options={businessUnitOptions}
              value={values.businessUnitIds}
              error={errors.businessUnitIds}
            />
          </Layouts.Flex>
        </Layouts.Margin>
      </Layouts.Padding>
    </Layouts.Scroll>
  );
};

export default observer(TruckQuickViewRightPanel);
