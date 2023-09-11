import React from 'react';
import { useTranslation } from 'react-i18next';
import { Checkbox, Layouts } from '@starlightpro/shared-components';
import { useFormikContext } from 'formik';
import { noop } from 'lodash-es';
import { observer } from 'mobx-react-lite';

import { FormInput, Section, Subsection, Tooltip, Typography } from '@root/common';
import ContactSelect from '@root/components/ContactSelect/ContactSelect';
import { BusinessLineType } from '@root/consts';
import { useStores } from '@root/hooks';
import { IConfigurableSubscriptionWorkOrder } from '@root/stores/subscriptionWorkOrder/SubscriptionWorkOrder';

const I18N_PATH = 'quickViews.SubscriptionWorkOrderEditQuickView.components.JobSite.';

const JobSiteSection: React.FC = () => {
  const { subscriptionStore } = useStores();
  const subscription = subscriptionStore.selectedEntity;
  const businessLineType = subscription?.businessLine.type;

  const { t } = useTranslation();
  const { values, setFieldValue, handleChange } =
    useFormikContext<IConfigurableSubscriptionWorkOrder>();

  return (
    <Section>
      <Subsection>
        <Layouts.Margin bottom="2">
          <Typography variant="headerThree">{t(`${I18N_PATH}Header`)}</Typography>
        </Layouts.Margin>
        <Layouts.Flex>
          <Layouts.Column>
            <Typography
              color="secondary"
              as="label"
              shade="desaturated"
              variant="bodyMedium"
              htmlFor="jobSiteContactId"
            >
              <Layouts.Margin as="span" right="1">
                {t(`${I18N_PATH}JobSiteContact`)}
              </Layouts.Margin>
              <Tooltip border inline position="top" text={t(`${I18N_PATH}JobSiteContactTooltip`)}>
                <Typography
                  color="secondary"
                  shade="desaturated"
                  cursor="pointer"
                  variant="caption"
                >
                  <Layouts.Flex
                    as={Layouts.Box}
                    alignItems="center"
                    justifyContent="center"
                    borderRadius="50%"
                    width="14px"
                    height="14px"
                  >
                    ?
                  </Layouts.Flex>
                </Typography>
              </Tooltip>
            </Typography>
            <ContactSelect
              placeholder={t(`${I18N_PATH}JobSiteContactSelect`)}
              name="jobSiteContactId"
              customerId={subscription?.customerJobSite?.customerId}
              value={values.jobSiteContactId}
              onSelectChange={setFieldValue}
              disabled
            />
            <Layouts.Flex>
              <Layouts.Column>
                <Layouts.Margin bottom="1">
                  <Checkbox name="poRequired" value={values.poRequired} onChange={noop} disabled>
                    {t(`${I18N_PATH}PONumberRequired`)}
                  </Checkbox>
                </Layouts.Margin>
                {businessLineType === BusinessLineType.portableToilets ? (
                  <Checkbox
                    name="permitRequired"
                    value={values.permitRequired}
                    onChange={noop}
                    disabled
                  >
                    {t(`${I18N_PATH}PermitRequired`)}
                  </Checkbox>
                ) : null}
              </Layouts.Column>
              <Layouts.Column>
                {businessLineType !== BusinessLineType.residentialWaste ? (
                  <Checkbox
                    name="signatureRequired"
                    value={values.signatureRequired}
                    disabled
                    onChange={handleChange}
                  >
                    {t(`${I18N_PATH}SignatureRequired`)}
                  </Checkbox>
                ) : null}
              </Layouts.Column>
            </Layouts.Flex>
          </Layouts.Column>
          <Layouts.Column>
            <Typography
              color="secondary"
              as="label"
              shade="desaturated"
              variant="bodyMedium"
              htmlFor="popupNote"
            >
              <Layouts.Margin as="span" right="1">
                {t(`${I18N_PATH}PupUpNote`)}
              </Layouts.Margin>
              <Tooltip border inline position="top" text={t(`${I18N_PATH}PupUpNoteTooltip`)}>
                <Typography
                  color="secondary"
                  shade="desaturated"
                  cursor="pointer"
                  variant="caption"
                >
                  <Layouts.Flex
                    as={Layouts.Box}
                    alignItems="center"
                    justifyContent="center"
                    borderRadius="50%"
                    width="14px"
                    height="14px"
                  >
                    ?
                  </Layouts.Flex>
                </Typography>
              </Tooltip>
            </Typography>
            <FormInput
              name="popupNote"
              key="popupNote"
              value={values.jobSiteNote}
              onChange={handleChange}
              disabled
              area
            />
          </Layouts.Column>
        </Layouts.Flex>
      </Subsection>
    </Section>
  );
};

export default observer(JobSiteSection);
