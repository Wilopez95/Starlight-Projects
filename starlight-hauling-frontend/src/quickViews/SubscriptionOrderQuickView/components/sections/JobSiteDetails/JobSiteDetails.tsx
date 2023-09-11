import React from 'react';
import { useTranslation } from 'react-i18next';
import { Checkbox, Layouts } from '@starlightpro/shared-components';
import { has, noop } from 'lodash-es';
import { observer } from 'mobx-react-lite';

import { Typography } from '@root/common';
import { Divider } from '@root/common/TableTools';
import { BusinessLineType } from '@root/consts/businessLine';
import { useStores } from '@root/hooks';
import { DetailItem } from '@root/pages/CustomerSubscriptionDetails/components';

const I18N_PATH = 'quickViews.SubscriptionOrderQuickView.components.sections.JobSiteDetails.';

const JobSiteDetails: React.FC<{ isWorkOrderView?: boolean }> = ({ isWorkOrderView = false }) => {
  const { subscriptionStore, subscriptionOrderStore } = useStores();
  const { t } = useTranslation();

  const subscription = subscriptionStore.selectedEntity;
  const subscriptionOrder = subscriptionOrderStore.selectedEntity;

  if (!subscription) {
    return null;
  }

  const businessLineType = subscription.businessLine.type;
  const hasPermits = [BusinessLineType.commercialWaste, BusinessLineType.portableToilets];
  const { jobSiteContact, jobSiteAddress } = subscription;
  const someoneOnSite =
    subscriptionOrder && has(subscriptionOrder, 'someoneOnSite')
      ? subscriptionOrder?.someoneOnSite
      : subscription.someoneOnSite;

  return (
    <>
      <Divider both />
      <Layouts.Margin top="2" bottom="2">
        <Typography variant="headerThree">{t(`${I18N_PATH}JobSiteDetails`)}</Typography>
        <Layouts.Flex justifyContent="space-between">
          <Layouts.Column>
            {isWorkOrderView ? (
              <>
                <Layouts.Margin top="2">
                  <DetailItem label={t(`${I18N_PATH}JobSite`)}>
                    <Typography>{jobSiteAddress}</Typography>
                  </DetailItem>
                </Layouts.Margin>
                <Layouts.Margin top="2">
                  <DetailItem label={t(`${I18N_PATH}JobSiteContact`)}>
                    <Typography>
                      {jobSiteContact.firstName} {jobSiteContact.lastName}
                    </Typography>
                  </DetailItem>
                </Layouts.Margin>
              </>
            ) : null}
            <Layouts.Margin top="2">
              <Checkbox
                value={subscriptionOrder?.poRequired}
                disabled
                name="poRequired"
                onChange={noop}
              >
                {t(`${I18N_PATH}PONumberRequired`)}
              </Checkbox>
            </Layouts.Margin>
            {businessLineType === BusinessLineType.portableToilets ? (
              <Layouts.Margin top="2">
                <Checkbox
                  value={subscriptionOrder?.permitRequired}
                  disabled
                  name="permitRequired"
                  onChange={noop}
                >
                  {t(`${I18N_PATH}PermitRequired`)}
                </Checkbox>
              </Layouts.Margin>
            ) : null}
            {businessLineType !== BusinessLineType.residentialWaste ? (
              <Layouts.Margin top="2">
                <Checkbox
                  value={subscriptionOrder?.signatureRequired}
                  disabled
                  name="signatureRequired"
                  onChange={noop}
                >
                  {t(`${I18N_PATH}SignatureRequired`)}
                </Checkbox>
              </Layouts.Margin>
            ) : null}
            {businessLineType === BusinessLineType.portableToilets && subscriptionOrder?.oneTime ? (
              <Layouts.Margin top="2">
                <Checkbox name="toRoll" value={subscriptionOrder?.toRoll} onChange={noop} disabled>
                  {t(`${I18N_PATH}OkToRoll`)}
                </Checkbox>
              </Layouts.Margin>
            ) : null}
          </Layouts.Column>
          <Layouts.Column>
            <Layouts.Margin top="2">
              <DetailItem label={t(`${I18N_PATH}BestTimeToCome`)}>
                <Typography>
                  {subscriptionOrder?.bestTimeToComeFrom} - {subscriptionOrder?.bestTimeToComeTo}
                </Typography>
              </DetailItem>
            </Layouts.Margin>
            <Layouts.Margin top="2">
              <Checkbox
                value={subscriptionOrder?.alleyPlacement}
                disabled
                name="alleyPlacement"
                onChange={noop}
              >
                {t(`${I18N_PATH}AlleyPlacement`)}
              </Checkbox>
            </Layouts.Margin>
            <Layouts.Margin top="2">
              <Checkbox
                value={subscriptionOrder?.highPriority}
                disabled
                name="highPriority"
                onChange={noop}
              >
                {t(`${I18N_PATH}HighPriority`)}
              </Checkbox>
            </Layouts.Margin>
            {businessLineType && hasPermits.includes(businessLineType) ? (
              <Layouts.Margin top="2">
                <Checkbox value={!!someoneOnSite} disabled name="someoneOnSite" onChange={noop}>
                  {t(`${I18N_PATH}SomeoneOnSite`)}
                </Checkbox>
              </Layouts.Margin>
            ) : null}
          </Layouts.Column>
        </Layouts.Flex>
      </Layouts.Margin>
    </>
  );
};

export default observer(JobSiteDetails);
