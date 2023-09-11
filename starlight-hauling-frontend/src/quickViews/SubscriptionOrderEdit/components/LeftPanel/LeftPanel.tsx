import React, { useCallback, useMemo, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Checkbox, Layouts } from '@starlightpro/shared-components';
import { useFormikContext } from 'formik';
import { observer } from 'mobx-react-lite';

import { EditIcon } from '@root/assets';
import { Badge, Typography } from '@root/common';
import { Divider, LeftPanelTools } from '@root/common/TableTools';
import { useBoolean, useBusinessContext, useScrollContainerHeight, useStores } from '@root/hooks';
import ChangePromoModal from '@root/quickViews/components/ChangePromoModal/ChangePromoModal';
import { IConfigurableSubscriptionOrder } from '@root/types';

import Summary from '../Summary/Summary';
import { UnlockOverrides } from '../UnlockOverrides/UnlockOverrides';

const I18N_PATH = 'quickViews.SubscriptionOrderEditQuickView.components.LeftPanel.';

const LeftPanel: React.FC = () => {
  const { subscriptionOrderStore, subscriptionStore, promoStore } = useStores();
  const { businessUnitId } = useBusinessContext();
  const containerRef = useRef<HTMLDivElement>(null);

  const { t } = useTranslation();
  const [isPromoModalOpen, openPromoModal, closePromoModal] = useBoolean();

  const subscriptionOrder = subscriptionOrderStore.selectedEntity;
  const subscription = subscriptionStore.selectedEntity;

  const { values, setFieldValue } = useFormikContext<IConfigurableSubscriptionOrder>();

  const oneTime = subscriptionOrder?.oneTime;

  const fallback = t(`${I18N_PATH}None`);

  const promoDescription = useMemo(() => {
    const promo =
      values.promoId === values.promo?.id ? values.promo : promoStore.getById(values.promoId);

    if (promo) {
      return `${promo.code}${promo.description ? `/${promo.description}` : ''} ${
        promo.note ? ` (${promo.note})` : ''
      }`;
    }

    return fallback;
  }, [fallback, promoStore, values.promo, values.promoId]);

  const handleChangeApplySurcharges = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, checked } = e.target;

      setFieldValue(name, checked);
    },
    [setFieldValue],
  );

  const { scrollContainerHeight, onAddRef } = useScrollContainerHeight({ containerRef });

  return (
    <Layouts.Flex
      as={Layouts.Box}
      ref={containerRef}
      height="100%"
      direction="column"
      justifyContent="space-between"
    >
      <ChangePromoModal
        onClose={closePromoModal}
        isOpen={isPromoModalOpen}
        businessLineId={values.businessLineId}
        businessUnitId={+businessUnitId}
      />
      <Layouts.Scroll maxHeight={scrollContainerHeight}>
        <Layouts.Padding top="2" bottom={oneTime ? '0' : '2'} left="3" right="3">
          <LeftPanelTools.Item>
            <Typography variant="headerThree">
              {t(`${I18N_PATH}Subscription`)} {!oneTime ? t(`${I18N_PATH}Servicing`) : null}{' '}
              {t(`${I18N_PATH}Order`)} #{subscriptionOrder?.sequenceId}
            </Typography>
            <Layouts.Margin top="2">
              <Badge borderRadius={2} color={subscriptionOrder?.statusColor}>
                {subscriptionOrder
                  ? t(`consts.SubscriptionOrderStatuses.${subscriptionOrder.statusLabel}`)
                  : ''}
              </Badge>
            </Layouts.Margin>
          </LeftPanelTools.Item>
          <Divider />
          <LeftPanelTools.Item>
            <Typography color="secondary">{t(`${I18N_PATH}LineOfBusiness`)}</Typography>
            <LeftPanelTools.Subitem>{subscription?.businessLine.name}</LeftPanelTools.Subitem>
          </LeftPanelTools.Item>
          <LeftPanelTools.Item>
            <Typography color="secondary">{t(`${I18N_PATH}ServiceArea`)}</Typography>
            <LeftPanelTools.Subitem>
              {subscription?.serviceArea?.name ?? fallback}
            </LeftPanelTools.Subitem>
          </LeftPanelTools.Item>
          <LeftPanelTools.Item>
            <Typography color="secondary">{t(`${I18N_PATH}Customer`)}</Typography>
            <LeftPanelTools.Subitem>
              {subscriptionOrder?.customer?.name ?? fallback}
            </LeftPanelTools.Subitem>
          </LeftPanelTools.Item>
          <LeftPanelTools.Item>
            <Typography color="secondary">{t(`${I18N_PATH}JobSiteAddress`)}</Typography>
            <LeftPanelTools.Subitem>
              {subscriptionOrder?.jobSiteAddress ?? fallback}
            </LeftPanelTools.Subitem>
          </LeftPanelTools.Item>
          <LeftPanelTools.Item>
            <Typography color="secondary">{t(`${I18N_PATH}TaxDistrict`)}</Typography>
            <LeftPanelTools.Subitem>
              {subscription?.taxDistricts?.map(({ districtName }) => districtName).join(', ') ??
                fallback}
            </LeftPanelTools.Subitem>
          </LeftPanelTools.Item>
          {oneTime ? (
            <LeftPanelTools.Item editable={oneTime} onClick={() => oneTime && openPromoModal()}>
              <Typography color="secondary">{t(`${I18N_PATH}Promo`)}:</Typography>
              <LeftPanelTools.Subitem>
                {promoDescription}
                {oneTime ? <EditIcon /> : null}
              </LeftPanelTools.Subitem>
            </LeftPanelTools.Item>
          ) : null}
        </Layouts.Padding>
      </Layouts.Scroll>

      <div ref={onAddRef}>
        <Layouts.Margin top="3">
          <Layouts.Padding left="3" right="3" bottom="2">
            <LeftPanelTools.Item>
              <Divider />
            </LeftPanelTools.Item>
            <LeftPanelTools.Item inline>
              <Checkbox
                id="applySurcharges"
                name="applySurcharges"
                value={values.applySurcharges}
                onChange={handleChangeApplySurcharges}
              >
                {t(`${I18N_PATH}ApplySurcharges`)}
              </Checkbox>
            </LeftPanelTools.Item>
            <LeftPanelTools.Item inline>
              <UnlockOverrides />
            </LeftPanelTools.Item>
            <Summary />
          </Layouts.Padding>
        </Layouts.Margin>
      </div>
    </Layouts.Flex>
  );
};

export default observer(LeftPanel);
