import React, { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { ISelectOption, Layouts, Select } from '@starlightpro/shared-components';
import { FieldArray, getIn, useFormikContext } from 'formik';
import { startCase } from 'lodash-es';
import { observer } from 'mobx-react-lite';

import { Typography } from '@root/common';
import { Divider } from '@root/common/TableTools';
import { enableRecyclingFeatures, isCore } from '@root/consts/env';
import { useStores } from '@root/hooks';
import { buildI18Path } from '@root/i18n/helpers';

import { IMaterialCodeFormData } from './formikData';

const I18N_PATH = buildI18Path(
  'pages.SystemConfiguration.tables.DisposalSites.MaterialMappingQuickView.',
);

const MaterialMappingQuickViewRightPanel: React.FC = ({ children }) => {
  const { disposalSiteStore, materialStore, lineItemStore } = useStores();
  const { t } = useTranslation();
  const { values, errors, setFieldValue } = useFormikContext<IMaterialCodeFormData>();

  const selectedDisposalSite = disposalSiteStore.selectedEntity;

  const landfillCodeOptions: ISelectOption[] = useMemo(
    () =>
      disposalSiteStore.recyclingCodes.map(recyclingCode => ({
        value: recyclingCode.id,
        label: recyclingCode.description,
        hint: recyclingCode.code,
      })),
    [disposalSiteStore.recyclingCodes],
  );

  const lineItemOptions: ISelectOption[] = lineItemStore.sortedValues.map(lineItem => ({
    value: lineItem.id,
    label: lineItem.description,
  }));

  const handleRecyclingMaterialIdChange = useCallback(
    (value: string | number | undefined, index: number) => {
      const recyclingCode = value
        ? disposalSiteStore.recyclingCodes.find(code => code.id.toString() === value.toString())
        : undefined;

      const recyclingMaterialId = recyclingCode?.id.toString() ?? '0';
      const recyclingMaterialDescription = recyclingCode?.description ?? '';
      const recyclingMaterialCode = recyclingCode?.code ?? null;

      setFieldValue(`materialCodes[${index}].recyclingMaterialId`, recyclingMaterialId);
      setFieldValue(
        `materialCodes[${index}].recyclingMaterialDescription`,
        recyclingMaterialDescription,
      );
      setFieldValue(`materialCodes[${index}].recyclingMaterialCode`, recyclingMaterialCode);
    },
    [disposalSiteStore.recyclingCodes, setFieldValue],
  );

  return (
    <Layouts.Scroll>
      <Layouts.Padding padding="3">
        <Layouts.Box as={Layouts.Flex} width="100%" direction="column">
          <Layouts.Flex direction="column">
            <Typography variant="headerThree">{selectedDisposalSite?.description}</Typography>

            <Typography variant="caption" textTransform="uppercase">
              {startCase(selectedDisposalSite?.waypointType)}
            </Typography>
          </Layouts.Flex>
          {enableRecyclingFeatures || !isCore ? (
            <Layouts.Box maxWidth="250px" width="100%">
              {children}
            </Layouts.Box>
          ) : null}
        </Layouts.Box>
        <Divider both />
        <Layouts.Grid columnGap="3" columns="200px 250px 250px">
          <Typography
            variant="bodyMedium"
            color="secondary"
            shade="light"
            textTransform="uppercase"
            as={Layouts.Margin}
            bottom="2"
          >
            {t(`${I18N_PATH.Form}Material`)}
          </Typography>
          <Typography
            variant="bodyMedium"
            color="secondary"
            shade="light"
            textTransform="uppercase"
            as={Layouts.Margin}
            bottom="2"
          >
            {t(`${I18N_PATH.Form}LandfillCode`)}
          </Typography>
          <Typography
            variant="bodyMedium"
            color="secondary"
            shade="light"
            textTransform="uppercase"
            as={Layouts.Margin}
            bottom="2"
          >
            {t(`${I18N_PATH.Form}BillableItem`)}
          </Typography>
          <FieldArray name="materialCodes">
            {() => {
              return values.materialCodes.map((materialCode, index) => {
                const material = materialStore.getById(materialCode.materialId);
                const billableLineItemId = materialCode.billableLineItemId
                  ? Number.parseInt(materialCode.billableLineItemId, 10)
                  : undefined;
                const recyclingMaterialId = materialCode.recyclingMaterialId
                  ? Number.parseInt(materialCode.recyclingMaterialId, 10)
                  : undefined;
                const filteredLandfillCodes = landfillCodeOptions.filter(
                  option =>
                    !values.materialCodes.find(code => {
                      return (
                        code.recyclingMaterialCode === option.hint &&
                        code.recyclingMaterialId !== materialCode.recyclingMaterialId
                      );
                    }),
                );

                return (
                  <React.Fragment key={materialCode.materialId}>
                    <Typography variant="bodyMedium">{material?.description}</Typography>
                    <Select
                      placeholder={t(`${I18N_PATH.Form}SelectLandfillCode`)}
                      key={`materialCodes[${index}].recyclingMaterialId`}
                      name={`materialCodes[${index}].recyclingMaterialId`}
                      value={recyclingMaterialId}
                      options={filteredLandfillCodes}
                      onSelectChange={(_, value) => handleRecyclingMaterialIdChange(value, index)}
                      error={getIn(errors, `materialCodes[${index}].recyclingMaterialId`)}
                    />
                    <Select
                      placeholder={t(`${I18N_PATH.Form}SelectBillableItem`)}
                      key={`materialCodes[${index}].billableLineItemId`}
                      name={`materialCodes[${index}].billableLineItemId`}
                      value={billableLineItemId}
                      options={lineItemOptions}
                      onSelectChange={setFieldValue}
                      error={getIn(errors, `materialCodes[${index}].billableLineItemId`)}
                    />
                  </React.Fragment>
                );
              });
            }}
          </FieldArray>
        </Layouts.Grid>
      </Layouts.Padding>
    </Layouts.Scroll>
  );
};

export default observer(MaterialMappingQuickViewRightPanel);
