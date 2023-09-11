/* eslint-disable @typescript-eslint/no-misused-promises */
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Layouts } from '@starlightpro/shared-components';
import { FieldArray, useFormikContext } from 'formik';
import { noop, startCase } from 'lodash-es';
import { observer } from 'mobx-react-lite';

import { IOrderRatesCalculateResponse } from '@root/api';
import { PlusIcon } from '@root/assets';
import { FilePreviewModal, Typography } from '@root/common';
import { Divider } from '@root/common/TableTools';
import { AddManifestModal } from '@root/components/modals';
import { BillableLineItemUnitTypeEnum } from '@root/consts';
import { handleEnterOrSpaceKeyDown } from '@root/helpers';
import { useBoolean, useStores, useUserContext } from '@root/hooks';
import {
  BillableLineItemType,
  IConfigurableOrder,
  IOrderNewManifestItem,
  JsonConversions,
} from '@root/types';

import { DeleteButton } from '../DeleteButton/DeleteButton';

import { ISelectedManifestItem } from './types';

const I18N_PATH = 'quickViews.OrderDetailsView.sections.Services.Text.';

interface IManifestItemsSection {
  editable?: boolean;
  onRateRequest(
    lineItem?: { lineItemId: number; materialId?: number | null },
    materialId?: number,
  ): Promise<JsonConversions<IOrderRatesCalculateResponse> | null>;
}

const ManifestItemsSection: React.FC<IManifestItemsSection> = ({ onRateRequest, editable }) => {
  const { values, setValues } = useFormikContext<IConfigurableOrder>();
  const [selectedManifest, setSelectedManifest] = useState<ISelectedManifestItem | undefined>(
    undefined,
  );
  const { materialStore, lineItemStore } = useStores();
  const [isOpenNewManifestModal, openNewManifestModal, closeNewManifestModal] = useBoolean();
  const { currentUser } = useUserContext();

  const [newManifestUrls, setNewManifestUrls] = useState<string[]>([]);
  const newManifestUrlsRef = useRef(newManifestUrls);

  newManifestUrlsRef.current = newManifestUrls;

  const lineItems = lineItemStore.values;
  const materials = materialStore.values;

  const { t } = useTranslation();

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (handleEnterOrSpaceKeyDown(e)) {
        openNewManifestModal();
      }
    },
    [openNewManifestModal],
  );

  const handleCloseModal = useCallback(() => {
    setSelectedManifest(undefined);
  }, []);

  const handleSubmitNewManifest = useCallback(
    async ({ file, ...newManifestItem }: IOrderNewManifestItem & { file: File }) => {
      closeNewManifestModal();

      const lineItemType: BillableLineItemType =
        newManifestItem.unitType === BillableLineItemUnitTypeEnum.TON
          ? 'manifestedDisposalByTon'
          : 'manifestedDisposalByYard';

      const billableLineItem = lineItems.find(x => x.type === lineItemType && x.active);
      const material = materials.find(element => element.id === newManifestItem.materialId);

      if (!billableLineItem || !material) {
        return;
      }

      const result = await onRateRequest({
        lineItemId: billableLineItem.id,
        materialId: billableLineItem.materialBasedPricing ? newManifestItem.materialId : undefined,
      });

      const global = result?.globalRates?.globalRatesLineItems?.[0];
      const custom = result?.customRates?.customRatesLineItems?.[0];
      const price = custom?.price ?? global?.price ?? 0;

      setValues(prev => ({
        ...prev,
        newManifestItems: [
          ...prev.newManifestItems,
          {
            ...newManifestItem,
            quantity: +newManifestItem.quantity,
            workOrderId: prev.workOrder?.id ?? 0,
            createdAt: new Date(),
          },
        ],
        manifestFiles: [...prev.manifestFiles, file],
        lineItems: [
          ...(prev.lineItems ?? []),
          {
            units: newManifestItem.unitType,
            applySurcharges: false,
            billableLineItemId: billableLineItem.id,
            billableLineItem: {
              ...lineItemStore.getUnObservedEntity(billableLineItem),
              originalId: billableLineItem.id,
            },
            material: {
              ...materialStore.getUnObservedEntity(material),
              originalId: material.id,
            },
            quantity: newManifestItem.quantity,
            materialId: newManifestItem.materialId,
            manifestNumber: newManifestItem.manifestNumber,
            price,
            globalRatesLineItemsId: global?.id,
            customRatesGroupLineItemsId: custom?.id,
          },
        ],
      }));
    },
    [
      closeNewManifestModal,
      lineItemStore,
      lineItems,
      materialStore,
      materials,
      onRateRequest,
      setValues,
    ],
  );

  useEffect(() => {
    setNewManifestUrls(prev => {
      prev.forEach(URL.revokeObjectURL);

      return values.manifestFiles.map(URL.createObjectURL);
    });
  }, [values.manifestFiles]);

  useEffect(() => {
    return () => {
      newManifestUrlsRef.current.forEach(URL.revokeObjectURL);
    };
  }, []);

  const { status, manifestItems, newManifestItems } = values;

  if (status !== 'completed' && !values.manifestItems?.length) {
    return null;
  }

  const isManifestsExist = manifestItems?.length > 0 || newManifestItems.length > 0;
  const isOverrideAllowed = values.unlockOverrides && values.workOrder?.id;

  return (
    <>
      <Layouts.Grid
        columns="20px repeat(6, 1fr)"
        rows="3.5rem"
        rowGap="2"
        columnGap="2"
        alignItems="center"
      >
        {isManifestsExist ? (
          <>
            <Layouts.Cell width={7}>
              <Typography variant="headerFour"> {t(`${I18N_PATH}Manifests`)}</Typography>
            </Layouts.Cell>
            <Layouts.Cell />

            <Layouts.Cell width={2}>
              <Typography shade="light" color="secondary" variant="bodyMedium">
                {t(`${I18N_PATH}ManifestNumber`)}
              </Typography>
            </Layouts.Cell>
            <Layouts.Cell width={2}>
              <Typography shade="light" color="secondary" variant="bodyMedium">
                {t(`${I18N_PATH}Material`)}
              </Typography>
            </Layouts.Cell>
            <Typography shade="light" color="secondary" variant="bodyMedium">
              {t(`${I18N_PATH}Value`)}
            </Typography>
            <Typography shade="light" color="secondary" variant="bodyMedium">
              {t(`${I18N_PATH}Unit`)}
            </Typography>
          </>
        ) : null}
        {selectedManifest ? (
          <FilePreviewModal
            src={selectedManifest.url}
            fileName={`Manifest #${selectedManifest.manifestNumber}`}
            category="Manifest item"
            author={selectedManifest.author}
            timestamp={selectedManifest.createdAt as Date}
            isOpen={!!selectedManifest}
            onClose={handleCloseModal}
            downloadSrc={selectedManifest.url}
            size="small"
            withMeta
          />
        ) : null}
        <FieldArray name="manifestItems">
          {({ remove }) =>
            manifestItems?.map((manifestItem, index) => (
              <React.Fragment key={index}>
                <DeleteButton onClick={() => remove(index)} disabled={!values.unlockOverrides} />
                <Layouts.Cell width={2}>
                  <Typography
                    color="information"
                    as="span"
                    onClick={() =>
                      setSelectedManifest({
                        ...manifestItem,
                        author: manifestItem?.csrName ?? t('Text.Missed'),
                      })
                    }
                  >
                    {manifestItem.manifestNumber}
                  </Typography>
                </Layouts.Cell>

                <Layouts.Cell width={2}>{manifestItem.material.description}</Layouts.Cell>
                <span>{manifestItem.quantity.toFixed(2)}</span>
                <span>{startCase(manifestItem.unitType)}</span>
              </React.Fragment>
            ))
          }
        </FieldArray>
        {status === 'completed' && !editable ? (
          <>
            <FieldArray name="newManifestItems">
              {() =>
                newManifestItems.map((newManifestItem, index) => (
                  <React.Fragment key={index}>
                    <DeleteButton
                      disabled={!values.unlockOverrides}
                      onClick={() => {
                        setValues(prev => {
                          prev.newManifestItems.splice(index, 1);
                          prev.manifestFiles.splice(index, 1);

                          return {
                            ...prev,
                            newManifestItems: [...prev.newManifestItems],
                            manifestFiles: [...prev.manifestFiles],
                          };
                        });
                      }}
                    />
                    <Layouts.Cell width={2}>
                      <Typography
                        color="information"
                        as="span"
                        onClick={() =>
                          setSelectedManifest({
                            ...newManifestItem,
                            url: newManifestUrls[index],
                            author: currentUser?.name,
                          })
                        }
                      >
                        {newManifestItem.manifestNumber}
                      </Typography>
                    </Layouts.Cell>

                    <Layouts.Cell width={2}>
                      {materialStore.getById(newManifestItem.materialId)?.description}
                    </Layouts.Cell>
                    <span>{newManifestItem.quantity.toFixed(2)}</span>
                    <span>{startCase(newManifestItem.unitType)}</span>
                  </React.Fragment>
                ))
              }
            </FieldArray>
            <Layouts.Cell width={7}>
              <Divider both />
            </Layouts.Cell>
            <Layouts.Cell width={7}>
              <AddManifestModal
                isOpen={isOpenNewManifestModal}
                onClose={closeNewManifestModal}
                onFormSubmit={handleSubmitNewManifest}
              />
              <Layouts.Flex justifyContent="flex-end">
                <Typography
                  tabIndex={0}
                  role="button"
                  textAlign="center"
                  color={isOverrideAllowed ? 'information' : 'grey'}
                  onClick={isOverrideAllowed ? openNewManifestModal : noop}
                  onKeyDown={isOverrideAllowed ? handleKeyDown : noop}
                >
                  <Layouts.Flex alignItems="center" justifyContent="flex-end">
                    <Layouts.IconLayout disableFill>
                      <PlusIcon />
                    </Layouts.IconLayout>
                    {t(`${I18N_PATH}AddManifest`)}
                  </Layouts.Flex>
                </Typography>
              </Layouts.Flex>
            </Layouts.Cell>
          </>
        ) : null}
      </Layouts.Grid>

      <Divider both />
    </>
  );
};

export default observer(ManifestItemsSection);
