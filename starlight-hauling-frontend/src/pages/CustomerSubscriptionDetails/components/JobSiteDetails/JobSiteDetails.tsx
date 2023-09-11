import React from 'react';
import { Checkbox, Layouts } from '@starlightpro/shared-components';
import { noop } from 'lodash-es';
import { observer } from 'mobx-react-lite';

import { Typography } from '@root/common';
import { BusinessLineType } from '@root/consts';
import { useIsRecyclingFacilityBU, useStores } from '@root/hooks';

import DetailItem from '../DetailItem/DetailItem';

const JobSiteDetails: React.FC = () => {
  const { subscriptionStore, subscriptionDraftStore } = useStores();
  const subscription = subscriptionStore.selectedEntity ?? subscriptionDraftStore.selectedEntity;

  const businessLineType = subscription?.businessLine.type;
  const hasPermits = [BusinessLineType.commercialWaste, BusinessLineType.portableToilets];

  const isRecyclingFacilityBU = useIsRecyclingFacilityBU();

  return (
    <Layouts.Margin top="2" bottom="2">
      <Typography variant="headerThree">Job Site Details</Typography>
      <Layouts.Flex justifyContent="space-between">
        <Layouts.Column>
          <Layouts.Margin top="2">
            <Checkbox value={!!subscription?.poRequired} disabled name="poRequired" onChange={noop}>
              PO Number Required
            </Checkbox>
          </Layouts.Margin>
          {businessLineType === BusinessLineType.portableToilets ? (
            <Layouts.Margin top="2">
              <Checkbox
                value={!!subscription?.permitRequired}
                disabled
                name="permitRequired"
                onChange={noop}
              >
                Permit Required
              </Checkbox>
            </Layouts.Margin>
          ) : null}
          {businessLineType !== BusinessLineType.residentialWaste ? (
            <Layouts.Margin top="2">
              <Checkbox
                value={!!subscription?.signatureRequired}
                disabled
                name="signatureRequired"
                onChange={noop}
              >
                Signature Required
              </Checkbox>
            </Layouts.Margin>
          ) : null}
          {businessLineType && hasPermits.includes(businessLineType) ? (
            <Layouts.Margin top="2">
              <Checkbox
                value={!!subscription?.someoneOnSite}
                disabled
                name="someoneOnSite"
                onChange={noop}
              >
                Someone On Site
              </Checkbox>
            </Layouts.Margin>
          ) : null}
        </Layouts.Column>
        <Layouts.Column>
          <DetailItem label="Best Time To Come">
            <Typography>
              {subscription?.bestTimeToComeFrom} - {subscription?.bestTimeToComeTo}
            </Typography>
          </DetailItem>
          {!isRecyclingFacilityBU ? (
            <Layouts.Margin top="2">
              <Checkbox
                value={!!subscription?.alleyPlacement}
                disabled
                name="alleyPlacement"
                onChange={noop}
              >
                Alley Placement
              </Checkbox>
            </Layouts.Margin>
          ) : null}
          <Layouts.Margin top="2">
            <Checkbox
              value={subscription?.highPriority}
              disabled
              name="highPriority"
              onChange={noop}
            >
              High Priority
            </Checkbox>
          </Layouts.Margin>
        </Layouts.Column>
      </Layouts.Flex>
    </Layouts.Margin>
  );
};

export default observer(JobSiteDetails);
