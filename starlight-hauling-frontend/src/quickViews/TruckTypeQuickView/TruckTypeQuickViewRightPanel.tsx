import React, { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Checkbox, Layouts } from '@starlightpro/shared-components';
import { useFormikContext } from 'formik';
import { omit } from 'lodash-es';
import { observer } from 'mobx-react-lite';

import { EditIcon } from '@root/assets';
import { FormInput, Typography } from '@root/common';
import { Divider } from '@root/common/TableTools';
import { handleEnterOrSpaceKeyDown } from '@root/helpers';
import { useBoolean, useStores } from '@root/hooks';
import { buildI18Path } from '@root/i18n/helpers';
import { ITruckFormikData } from '@root/types';

import { EquipmentModal, MaterialModal } from './modals';
import * as Styles from './styles';

const I18N_PATH = buildI18Path('pages.SystemConfiguration.tables.TruckTypes.');

const TruckTypeQuickViewRightPanel: React.FC = () => {
  const { values, errors, handleChange, setErrors } = useFormikContext<ITruckFormikData>();
  const { truckTypeStore, systemConfigurationStore } = useStores();
  const { t } = useTranslation();
  const [currentBusinessLine, setBusinessLine] = useState(0);

  const [isEquipmentModalOpen, toggleEquipmentModalOpen, setEquipmentModalClose] =
    useBoolean(false);
  const [isMaterialModalOpen, toggleMaterialModalOpen, setMaterialModalClose] = useBoolean(false);

  const selectedTruckType = truckTypeStore.selectedEntity;
  const isCreating = systemConfigurationStore.isCreating;
  const isNew = !selectedTruckType || isCreating;

  const handleEquipmentChange = (
    blID: number,
    e?: React.KeyboardEvent<HTMLOrSVGElement> | React.KeyboardEvent,
  ) => {
    if (e && !handleEnterOrSpaceKeyDown(e)) {
      return;
    }
    setBusinessLine(blID);
    toggleEquipmentModalOpen();
  };

  const handleMaterialChange = (
    blID: number,
    e?: React.KeyboardEvent<HTMLOrSVGElement> | React.KeyboardEvent,
  ) => {
    if (e && !handleEnterOrSpaceKeyDown(e)) {
      return;
    }
    setBusinessLine(blID);
    toggleMaterialModalOpen();
  };

  const handleChangeCheckbox = useCallback(
    e => {
      const hasActiveBusinessLines = !values?.businessLines?.some(({ active }) => active);

      if (hasActiveBusinessLines) {
        setErrors(omit(errors, 'businessLines'));
      }

      return handleChange(e);
    },
    [errors, handleChange, setErrors, values?.businessLines],
  );

  return (
    <Layouts.Scroll>
      <EquipmentModal
        isOpen={isEquipmentModalOpen}
        onClose={setEquipmentModalClose}
        businessLineId={currentBusinessLine}
        isNew={isNew}
      />
      <MaterialModal
        isOpen={isMaterialModalOpen}
        onClose={setMaterialModalClose}
        businessLineId={currentBusinessLine}
        isNew={isNew}
      />
      <Layouts.Padding padding="3">
        <Typography variant="headerThree">
          {isNew ? t(`${I18N_PATH.Text}NewTruckType`) : selectedTruckType?.description}
        </Typography>

        <Typography variant="caption" textTransform="uppercase">
          {t(`${I18N_PATH.Text}TruckType`)}
        </Typography>

        <Divider both />
        <Styles.StyledStatusWrapper>
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
        </Styles.StyledStatusWrapper>
        <Styles.StyledStatusWrapper>
          <Layouts.Column>
            <Layouts.Margin top="1">
              <Typography color="secondary" as="label" htmlFor="description" shade="desaturated">
                {t('Text.Description')}*
              </Typography>
            </Layouts.Margin>
          </Layouts.Column>
          <Layouts.Column>
            <FormInput
              area
              name="description"
              onChange={handleChange}
              value={values.description}
              error={errors.description}
            />
          </Layouts.Column>
        </Styles.StyledStatusWrapper>
        <Divider />
      </Layouts.Padding>
      <Layouts.Padding padding="3">
        <Styles.StyledStatusWrapper>
          <Layouts.Column>
            <Typography color="secondary" shade="desaturated">
              {t(`${I18N_PATH.Text}BusinessLines`)}*
            </Typography>
          </Layouts.Column>
          <Layouts.Column>
            {values.businessLines
              ? values.businessLines.map(({ name, id, equipmentItems, materials }, index) => (
                  <div key={`${index}-${id}`}>
                    <Layouts.Margin bottom="1">
                      <Checkbox
                        id={`businessLines[${index}].active`}
                        name={`businessLines[${index}].active`}
                        value={values.businessLines[index].active}
                        onChange={handleChangeCheckbox}
                      >
                        <Layouts.Box width="150px">
                          <Typography color="secondary" shade="desaturated" ellipsis>
                            {name}
                          </Typography>
                        </Layouts.Box>
                      </Checkbox>
                      {values.businessLines[index].active ? (
                        <>
                          <Layouts.Margin bottom="1" top="1">
                            {equipmentItems.length > 0
                              ? equipmentItems
                                  .filter(({ active }) => active)
                                  .map(
                                    ({
                                      description,
                                      id: equipmentId,
                                    }: {
                                      description: string;
                                      id: number;
                                    }) => (
                                      <div key={`${equipmentId}-${description}`}>
                                        <Layouts.Padding padding="0.5" left="3">
                                          <Typography
                                            variant="bodyMedium"
                                            color="secondary"
                                            shade="light"
                                          >
                                            {description}
                                          </Typography>
                                        </Layouts.Padding>
                                      </div>
                                    ),
                                  )
                              : null}
                            <Typography
                              variant="bodyMedium"
                              color="information"
                              cursor="pointer"
                              onClick={() => handleEquipmentChange(id)}
                            >
                              <Layouts.Flex alignItems="center">
                                <Layouts.IconLayout>
                                  <EditIcon
                                    role="button"
                                    aria-label="SelectServices"
                                    tabIndex={0}
                                    onKeyDown={e => handleEquipmentChange(id, e)}
                                  />
                                </Layouts.IconLayout>
                                {t(`${I18N_PATH.Text}SetEquipment`)}
                              </Layouts.Flex>
                            </Typography>
                          </Layouts.Margin>
                          {materials.length > 0
                            ? materials
                                .filter(({ active }) => active)
                                .map(
                                  ({
                                    description,
                                    id: materialId,
                                  }: {
                                    description: string;
                                    id: number;
                                  }) => (
                                    <div key={`${materialId}-${description}`}>
                                      <Layouts.Padding padding="0.5" left="3">
                                        <Typography
                                          variant="bodyMedium"
                                          color="secondary"
                                          shade="light"
                                        >
                                          {description}
                                        </Typography>
                                      </Layouts.Padding>
                                    </div>
                                  ),
                                )
                            : null}
                          <Typography
                            variant="bodyMedium"
                            color="information"
                            cursor="pointer"
                            onClick={() => handleMaterialChange(id)}
                          >
                            <Layouts.Flex alignItems="center">
                              <Layouts.IconLayout>
                                <EditIcon
                                  role="button"
                                  aria-label="SelectServices"
                                  tabIndex={0}
                                  onKeyDown={e => handleMaterialChange(id, e)}
                                />
                              </Layouts.IconLayout>
                              {t(`${I18N_PATH.Text}SetMaterial`)}
                            </Layouts.Flex>
                          </Typography>
                        </>
                      ) : null}
                    </Layouts.Margin>
                  </div>
                ))
              : null}
          </Layouts.Column>
        </Styles.StyledStatusWrapper>
        {errors?.businessLines ? (
          <Typography color="alert" variant="bodyMedium">
            {errors?.businessLines}
          </Typography>
        ) : null}
      </Layouts.Padding>
    </Layouts.Scroll>
  );
};

export default observer(TruckTypeQuickViewRightPanel);
