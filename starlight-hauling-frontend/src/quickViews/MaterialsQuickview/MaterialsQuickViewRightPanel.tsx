import React from 'react';
import { useTranslation } from 'react-i18next';
import { Checkbox, Layouts } from '@starlightpro/shared-components';
import { useFormikContext } from 'formik';
import { xor } from 'lodash';

import { FormInput, Typography } from '@root/common';
import { Divider, Table } from '@root/common/TableTools';
import { useBusinessContext, useStores } from '@root/hooks';
import { buildI18Path } from '@root/i18n/helpers';
import { IMaterial } from '@root/types';

import styles from './css/styles.scss';

const I18N_PATH = buildI18Path(
  'pages.SystemConfiguration.tables.BusinessLinesConfiguration.tables.Materials.QuickView.',
);

export const MaterialQuickViewRightPanel: React.FC = () => {
  const { equipmentItemStore, materialStore, systemConfigurationStore, businessLineStore } =
    useStores();
  const equipmentItems = equipmentItemStore.sortedValues;
  const selectedMaterial = materialStore.selectedEntity;
  const isCreating = systemConfigurationStore.isCreating;
  const isNew = isCreating || !selectedMaterial;

  const { businessLineId } = useBusinessContext();
  const isRollOffType = businessLineStore.isRollOffType(businessLineId);
  const isRecyclingLoB = businessLineStore.isRecyclingType(businessLineId);

  const { t } = useTranslation();

  const { values, errors, handleChange, setFieldValue, setFieldError } =
    useFormikContext<IMaterial>();

  // TODO use an object or map here instead of array of IDs and transform it to array before sending
  const equipmentItemCheckboxes = equipmentItems.map(equipmentItem => (
    <tr key={equipmentItem.id}>
      <td className={styles.checkboxRow} colSpan={3}>
        <Checkbox
          id={`equipmentItem[${equipmentItem.id}]`}
          value={values.equipmentItemIds?.includes(equipmentItem.id)}
          onChange={() => {
            setFieldValue('equipmentItemIds', xor(values.equipmentItemIds, [equipmentItem.id]));
            setFieldError('equipmentItemIds', undefined);
          }}
          name={String(equipmentItem.id)}
        >
          {equipmentItem.description}
        </Checkbox>
      </td>
    </tr>
  ));

  const title = isNew || !values.description ? 'Create New Material' : values.description;

  return (
    <Layouts.Scroll>
      <Layouts.Padding padding="3">
        <Layouts.Margin top="1" right="2">
          <Typography ellipsis variant="headerThree">
            {title}
          </Typography>
        </Layouts.Margin>
        <Divider both />
        <div className={styles.formContainer}>
          <Table>
            <tbody>
              <tr>
                <td className={styles.space}>Status</td>
                <td>
                  <Checkbox
                    id="activeCheckbox"
                    name="active"
                    value={values.active}
                    onChange={handleChange}
                    labelClass={styles.activeCheckbox}
                  >
                    {t('Text.Active')}
                  </Checkbox>
                </td>
              </tr>
              <tr>
                <td className={styles.space}>
                  <Typography as="label" htmlFor="description" variant="bodyMedium" shade="light">
                    Description*
                  </Typography>
                </td>
                <td>
                  <FormInput
                    name="description"
                    onChange={handleChange}
                    value={values.description}
                    error={errors.description}
                    area
                  />
                </td>
              </tr>
              {isRecyclingLoB ? (
                <tr>
                  <td className={styles.space}>
                    <Typography as="label" htmlFor="code" variant="bodyMedium" shade="light">
                      Material Code
                    </Typography>
                  </td>
                  <td>
                    <FormInput
                      name="code"
                      onChange={handleChange}
                      value={values.code}
                      error={errors.code}
                    />
                  </td>
                </tr>
              ) : null}
              {!isRecyclingLoB ? (
                <tr>
                  <td className={styles.checkboxRow} colSpan={3}>
                    <Checkbox
                      id="manifested"
                      value={values.manifested}
                      onChange={handleChange}
                      name="manifested"
                    >
                      {t('Text.Manifested')}
                    </Checkbox>
                  </td>
                </tr>
              ) : null}
              <tr>
                <td className={styles.checkboxRow} colSpan={3}>
                  <Checkbox
                    id="recycle"
                    value={values.recycle}
                    onChange={handleChange}
                    name="recycle"
                  >
                    {t('Text.Recycle')}
                  </Checkbox>
                </td>
              </tr>
              {isRollOffType || isRecyclingLoB ? (
                <>
                  <tr>
                    <td className={styles.checkboxRow} colSpan={3}>
                      <Checkbox id="yard" name="yard" value={values.yard} onChange={handleChange}>
                        {t(`${I18N_PATH.Text}UseForYard`)}
                      </Checkbox>
                    </td>
                  </tr>
                  <tr>
                    <td className={styles.checkboxRow} colSpan={3}>
                      <Checkbox id="misc" name="misc" value={values.misc} onChange={handleChange}>
                        {t(`${I18N_PATH.Text}UseForYarMiscItem`)}
                      </Checkbox>
                    </td>
                  </tr>
                </>
              ) : null}
              {isRollOffType ? (
                <tr>
                  <td className={styles.checkboxRow} colSpan={3}>
                    <Checkbox
                      id="landfillCanOverride"
                      name="landfillCanOverride"
                      value={values.landfillCanOverride}
                      onChange={handleChange}
                    >
                      {t(`${I18N_PATH.Text}LandfillCanOverride`)}
                    </Checkbox>
                  </td>
                </tr>
              ) : null}
              {isRecyclingLoB ? (
                <>
                  <tr>
                    <td className={styles.checkboxRow} colSpan={3}>
                      <Checkbox
                        id="useForDump"
                        name="useForDump"
                        value={values.useForDump}
                        onChange={handleChange}
                      >
                        {t(`${I18N_PATH.Text}UseForDump`)}
                      </Checkbox>
                    </td>
                  </tr>
                  <tr>
                    <td className={styles.checkboxRow} colSpan={3}>
                      <Checkbox
                        id="useForLoad"
                        name="useForLoad"
                        value={values.useForLoad}
                        onChange={handleChange}
                      >
                        {t(`${I18N_PATH.Text}UseForLoad`)}
                      </Checkbox>
                    </td>
                  </tr>
                </>
              ) : null}
              {!isRecyclingLoB ? (
                <>
                  <Divider bottom colSpan={3} />
                  <tr>
                    <td className={styles.spaceSmall}>Usable Equipment</td>
                  </tr>
                  {equipmentItemCheckboxes}
                  <tr>
                    {errors.equipmentItemIds ? (
                      <td className={styles.validationText} colSpan={3}>
                        {errors.equipmentItemIds}
                      </td>
                    ) : null}
                  </tr>
                </>
              ) : null}
            </tbody>
          </Table>
        </div>
      </Layouts.Padding>
    </Layouts.Scroll>
  );
};
