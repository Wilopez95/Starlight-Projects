import React, { useCallback, useEffect, useLayoutEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router';
import { Button, Checkbox, ISelectOption, Layouts, Select } from '@starlightpro/shared-components';
import { useFormikContext } from 'formik';
import { noop, startCase } from 'lodash-es';
import { observer } from 'mobx-react-lite';

import { DeleteIcon } from '@root/assets';
import { Section, Subsection, Switch, Tooltip, Typography } from '@root/common';
import { AppliedTaxesModal } from '@root/components/modals';
import NextSubscriptionPrice from '@root/components/NextSubscriptionPrice/NextSubscriptionPrice';
import SubscriptionPrice from '@root/components/SubscriptionPrice/SubscriptionPrice';
import { handleEnterOrSpaceKeyDown } from '@root/helpers';
import {
  useBoolean,
  useBusinessContext,
  useCrudPermissions,
  usePermission,
  useStores,
  useToggle,
} from '@root/hooks';
import { useIntl } from '@root/i18n/useIntl';

import { INewSubscription, INewSubscriptionFormParams } from '../../types';

import ReviewProration from './components/ReviewProration/ReviewProration';
import { ISummarySection } from './types';

const I18N_PATH =
  'pages.NewRequest.NewRequestForm.forms.Subscription.sections.Summary.Summary.Text.';

const SummarySection: React.FC<ISummarySection> = ({
  proration,
  isSubscriptionClosed,
  isReviewProrationModalOpen,
  onOpenReviewProrationModal,
  onCloseReviewProrationModal,
}) => {
  const params = useParams<INewSubscriptionFormParams>();
  const { values, isValid, errors, setFieldValue } = useFormikContext<INewSubscription>();
  const { businessUnitId } = useBusinessContext();
  const { t } = useTranslation();

  const [isTaxesModalOpen, openTaxesModal, closeTaxesModal] = useBoolean();
  const [canViewSubscriptionsList] = useCrudPermissions('subscriptions', 'all');
  const [canViewMySubscriptionsList] = useCrudPermissions('subscriptions', 'own');
  const canUnlockSubscriptionOverrides = usePermission('subscriptions:unlock-overrides:perform');

  const [isPromoSearchShown, togglePromoSearchShown] = useToggle(values.promoApplied);
  const { promoStore, billableServiceStore, lineItemStore } = useStores();

  const subscriptionId = params.subscriptionId ? +params.subscriptionId : undefined;

  const { formatCurrency } = useIntl();

  useLayoutEffect(() => {
    setFieldValue('promoApplied', isPromoSearchShown);
  }, [isPromoSearchShown, setFieldValue]);

  useEffect(() => {
    promoStore.cleanup();
    promoStore.request({
      businessLineId: values.businessLineId,
      businessUnitId,
      activeOnly: true,
      excludeExpired: true,
    });
  }, [promoStore, businessUnitId, values.businessLineId]);

  const taxesTotal = proration?.taxesInfo.taxesTotal ?? 0;
  const taxDistrictsCount = proration?.taxesInfo.taxDistrictNames.length ?? 0;

  const promoOptions: ISelectOption[] = useMemo(
    () =>
      promoStore.sortedValues.map(promo => ({
        label: promo.name,
        value: promo.id,
        hint: promo.note ?? '',
      })),
    [promoStore.sortedValues],
  );

  const handleChangeUnlockOverrides = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, checked } = e.target;

      setFieldValue(name, checked);
    },
    [setFieldValue],
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLOrSVGElement>) => {
      if (handleEnterOrSpaceKeyDown(e)) {
        togglePromoSearchShown();
      }
    },
    [togglePromoSearchShown],
  );

  return (
    <Section>
      {proration ? (
        <AppliedTaxesModal
          isOpen={isTaxesModalOpen}
          onClose={closeTaxesModal}
          taxesInfo={proration.taxesInfo}
        />
      ) : null}
      <Subsection>
        <Layouts.Flex>
          <Layouts.Column>
            <Layouts.Margin bottom="1">
              <Typography variant="headerThree">{t(`${I18N_PATH}Summary`)}</Typography>
            </Layouts.Margin>
            {isPromoSearchShown ? (
              <Layouts.Flex alignItems="center">
                <Layouts.IconLayout remove>
                  <DeleteIcon
                    role="button"
                    tabIndex={0}
                    aria-label={t('Text.Remove')}
                    onKeyDown={handleKeyDown}
                    onClick={togglePromoSearchShown}
                  />
                </Layouts.IconLayout>
                <Layouts.Box width="90%">
                  <Select
                    placeholder={t(`${I18N_PATH}SelectPromo`)}
                    label={t(`${I18N_PATH}Promotion`)}
                    name="promoId"
                    options={promoOptions}
                    value={values.promoId ?? ''}
                    onSelectChange={setFieldValue}
                    error={errors.promoId}
                    searchable
                    exactSearch
                    disabled={isSubscriptionClosed}
                  />
                </Layouts.Box>
              </Layouts.Flex>
            ) : (
              <Layouts.Margin top="3">
                <Button
                  variant="none"
                  disabled={isSubscriptionClosed}
                  onClick={togglePromoSearchShown}
                >
                  <Typography variant="bodyMedium" color="information" cursor="pointer">
                    + {t(`${I18N_PATH}AddPromoCode`)}
                  </Typography>
                </Button>
              </Layouts.Margin>
            )}
            <Layouts.Margin top="3">
              <Checkbox
                name="applySurcharges"
                value={values.alleyPlacement}
                onChange={noop} // TODO: Would be fixed in HAULING-6257
                disabled
                tabIndex={0}
              >
                {t(`${I18N_PATH}ApplySurcharges`)}
              </Checkbox>
            </Layouts.Margin>
          </Layouts.Column>
          <Layouts.Column>
            <Layouts.Flex direction="column" alignItems="flex-end">
              {canUnlockSubscriptionOverrides &&
              (canViewSubscriptionsList || canViewMySubscriptionsList) ? (
                <Switch
                  name="unlockOverrides"
                  value={values.unlockOverrides}
                  onChange={handleChangeUnlockOverrides}
                >
                  {t(`${I18N_PATH}UnlockOverrides`)}
                </Switch>
              ) : (
                <Layouts.Padding top="2.5" />
              )}
            </Layouts.Flex>
            <Layouts.Box width="80%" float="right">
              <Layouts.Flex direction="column" alignItems="flex-end">
                <Layouts.Padding top="1" bottom="1">
                  <Typography
                    variant="bodyMedium"
                    color="secondary"
                    shade="desaturated"
                    textAlign="right"
                  >
                    <Layouts.Flex>
                      <Layouts.Margin right="4">
                        <Layouts.Box width="100px">{t(`${I18N_PATH}BillingCycle`)}:</Layouts.Box>
                      </Layouts.Margin>
                      <Layouts.Box width="100px">{startCase(values.billingCycle)}</Layouts.Box>
                    </Layouts.Flex>
                  </Typography>
                </Layouts.Padding>
                <SubscriptionPrice
                  proration={proration}
                  billableServices={billableServiceStore.values}
                  billableLineItems={lineItemStore.values}
                />
                <Layouts.Padding top="1" bottom="1">
                  <Typography
                    variant="bodyMedium"
                    color="secondary"
                    shade="desaturated"
                    textAlign="right"
                  >
                    <Layouts.Flex>
                      <Layouts.Margin right="4">
                        <Layouts.Box width="100px">{t(`${I18N_PATH}Service`)}:</Layouts.Box>
                      </Layouts.Margin>
                      <Layouts.Box width="100px">
                        {formatCurrency(proration?.serviceTotal)}
                      </Layouts.Box>
                    </Layouts.Flex>
                  </Typography>
                </Layouts.Padding>
                <Layouts.Padding top="1" bottom="1">
                  <Typography
                    variant="bodyMedium"
                    color="secondary"
                    shade="desaturated"
                    textAlign="right"
                  >
                    <Layouts.Flex>
                      <Layouts.Margin right="4">
                        <Layouts.Box width="200px">
                          {t(`${I18N_PATH}RecurringLineItem`)}:
                        </Layouts.Box>
                      </Layouts.Margin>
                      <Layouts.Box width="100px">
                        {formatCurrency(proration?.lineItemsTotal)}
                      </Layouts.Box>
                    </Layouts.Flex>
                  </Typography>
                </Layouts.Padding>
                <Layouts.Padding top="1" bottom="1">
                  <Typography
                    variant="bodyMedium"
                    color="secondary"
                    shade="desaturated"
                    textAlign="right"
                  >
                    <Layouts.Flex>
                      <Layouts.Margin right="4">
                        <Layouts.Box width="200px">
                          {t(`${I18N_PATH}SubscriptionOrder`)}:
                        </Layouts.Box>
                      </Layouts.Margin>
                      <Layouts.Box width="100px">
                        {formatCurrency(proration?.subscriptionOrdersTotal)}
                      </Layouts.Box>
                    </Layouts.Flex>
                  </Typography>
                </Layouts.Padding>
                <NextSubscriptionPrice
                  proration={proration}
                  billableServices={billableServiceStore.values}
                  billableLineItems={lineItemStore.values}
                />
                <Layouts.Padding top="1" bottom="1">
                  <Typography variant="bodyMedium" textAlign="right">
                    <Layouts.Flex>
                      <Layouts.Margin right="4">
                        <Layouts.Box width="100px">
                          {t('Text.TaxDistrict', { count: taxDistrictsCount })}:
                        </Layouts.Box>
                      </Layouts.Margin>
                      <Layouts.Box width="100px">
                        {proration?.taxesInfo.taxDistrictNames.map(districtName => (
                          <div key={districtName}>{districtName}</div>
                        ))}
                      </Layouts.Box>
                    </Layouts.Flex>
                  </Typography>
                </Layouts.Padding>

                <Layouts.Padding top="1" bottom="1">
                  <Typography variant="bodyMedium" textAlign="right">
                    <Layouts.Flex>
                      <Layouts.Margin right="4">
                        <Layouts.Box width="100px">{t(`${I18N_PATH}Taxes`)}:</Layouts.Box>
                      </Layouts.Margin>
                      <Layouts.Box width="100px">
                        <Typography
                          onClick={openTaxesModal}
                          variant="bodyMedium"
                          textAlign="right"
                          cursor={taxesTotal > 0 ? 'pointer' : undefined}
                          tabIndex={0}
                          textDecoration={taxesTotal > 0 ? 'underline dotted' : undefined}
                        >
                          {formatCurrency(taxesTotal)}
                        </Typography>
                      </Layouts.Box>
                    </Layouts.Flex>
                  </Typography>
                </Layouts.Padding>
              </Layouts.Flex>
            </Layouts.Box>
          </Layouts.Column>
        </Layouts.Flex>

        {proration && values.showProrationButton && isValid ? (
          <ReviewProration
            proration={proration}
            subscriptionId={subscriptionId}
            isReviewProrationModalOpen={isReviewProrationModalOpen}
            onCloseReviewProrationModal={onCloseReviewProrationModal}
            onOpenReviewProrationModal={onOpenReviewProrationModal}
          />
        ) : null}
      </Subsection>
      <Subsection gray>
        <Typography variant="bodyMedium" textAlign="right" fontWeight="semiBold">
          <Layouts.Flex justifyContent="flex-end">
            <Layouts.Margin right="4">
              <Tooltip
                position="top"
                text={t(`${I18N_PATH}GrandTotalHint`)}
                normalizeTypography={false}
              >
                <Layouts.Box width="190px">{t(`${I18N_PATH}GrandTotal`)}:</Layouts.Box>
              </Tooltip>
            </Layouts.Margin>
            <Layouts.Box width="100px">{formatCurrency(values.grandTotal)}</Layouts.Box>
          </Layouts.Flex>
        </Typography>
      </Subsection>
    </Section>
  );
};

export default observer(SummarySection);
