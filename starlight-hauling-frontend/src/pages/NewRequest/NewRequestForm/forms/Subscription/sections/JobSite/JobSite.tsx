import React, { useCallback, useEffect, useMemo } from 'react';
import { useParams } from 'react-router';
import { Checkbox, ISelectOptionGroup, Layouts, Select } from '@starlightpro/shared-components';
import { useFormikContext } from 'formik';
import { observer } from 'mobx-react-lite';

import { PlusIcon } from '@root/assets';
import { DescriptiveTooltip, FormInput, Section, Subsection, Typography } from '@root/common';
import { type IContactFormData } from '@root/components/forms/NewContact/types';
import { NewContactModal } from '@root/components/modals';
import { Routes } from '@root/consts';
import { BusinessLineType } from '@root/consts/businessLine';
import { handleEnterOrSpaceKeyDown } from '@root/helpers';
import { useBusinessContext, useStores, useToggle } from '@root/hooks';

import { INewSubscription, INewSubscriptionFormParams } from '../../types';

import { IJobSiteSection } from './types';

const businessLinesList = [BusinessLineType.rollOff, BusinessLineType.portableToilets];

const JobSiteSection: React.FC<IJobSiteSection> = ({ isSubscriptionClosed }) => {
  const { entity: entityParam } = useParams<INewSubscriptionFormParams>();
  const isSubscriptionEdit = entityParam === Routes.Subscription;

  const { values, errors, handleChange, setFieldValue } = useFormikContext<INewSubscription>();

  const { contactStore, customerStore, businessLineStore } = useStores();
  const [isNewContactModalOpen, toggleIsNewContactModalOpen] = useToggle();

  const selectedCustomer = customerStore.selectedEntity;
  const businessLineType = businessLineStore.getById(values.businessLineId)?.type ?? '';

  const { businessUnitId } = useBusinessContext();

  useEffect(() => {
    if (selectedCustomer) {
      contactStore.requestByCustomer({ customerId: selectedCustomer.id, activeOnly: true });
    }
  }, [contactStore, selectedCustomer]);

  const handleNewContactFormSubmit = useCallback(
    (valuesData: IContactFormData) => {
      valuesData.phoneNumbers?.forEach(phoneNumber => {
        if (phoneNumber.id === 0) {
          // TODO: fix it later
          delete phoneNumber.id;
        }
      });

      if (selectedCustomer) {
        contactStore.create(
          {
            ...valuesData,
            active: true,
            customerId: valuesData.temporaryContact ? undefined : selectedCustomer.id,
            main: false,
          },
          businessUnitId,
        );
      }
      toggleIsNewContactModalOpen();
    },
    [contactStore, selectedCustomer, toggleIsNewContactModalOpen, businessUnitId],
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLOrSVGElement>) => {
      if (handleEnterOrSpaceKeyDown(e)) {
        toggleIsNewContactModalOpen();
      }
    },
    [toggleIsNewContactModalOpen],
  );

  const contactOptions: ISelectOptionGroup[] = useMemo(() => {
    return [
      {
        options: contactStore.values.map(contact => ({
          label: contact.name,
          value: contact.id,
          hint: contact.jobTitle ?? '',
        })),
        footer: (
          <Typography
            color="information"
            cursor="pointer"
            variant="bodyMedium"
            role="button"
            tabIndex={0}
            onKeyDown={handleKeyDown}
          >
            <Layouts.IconLayout width="12px" height="12px">
              <PlusIcon />
            </Layouts.IconLayout>
            Create new contact
          </Typography>
        ),
        onFooterClick: toggleIsNewContactModalOpen,
      },
    ];
  }, [contactStore.values, handleKeyDown, toggleIsNewContactModalOpen]);

  return (
    <>
      <NewContactModal
        isOpen={isNewContactModalOpen}
        onFormSubmit={handleNewContactFormSubmit}
        onClose={toggleIsNewContactModalOpen}
        half
      />
      <Section>
        <Subsection>
          <Layouts.Margin bottom="2">
            <Typography variant="headerThree">Customer/Job Site Pair Details</Typography>
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
                <Layouts.Margin right="1" as="span">
                  Job site contact*
                </Layouts.Margin>
                <DescriptiveTooltip position="top" text="Contact for drivers to call on way" />
              </Typography>
              <Select
                placeholder="Select job site contact"
                key="jobSiteContactId"
                name="jobSiteContactId"
                options={contactOptions}
                value={values.jobSiteContactId}
                error={errors.jobSiteContactId}
                onSelectChange={setFieldValue}
                disabled={isSubscriptionClosed}
              />
              <Layouts.Flex>
                <Layouts.Column>
                  <Layouts.Margin bottom="1">
                    <Checkbox
                      name="poRequired"
                      value={values.poRequired}
                      error={errors.poRequired}
                      onChange={handleChange}
                      disabled={!!values.customerJobSiteId || isSubscriptionEdit}
                    >
                      PO number required
                    </Checkbox>
                  </Layouts.Margin>

                  {businessLineType && businessLinesList.includes(businessLineType) ? (
                    <Checkbox
                      name="permitRequired"
                      value={values.permitRequired ?? undefined}
                      error={errors.permitRequired}
                      onChange={handleChange}
                      disabled={!!values.customerJobSiteId || isSubscriptionEdit}
                    >
                      Permit required
                    </Checkbox>
                  ) : null}
                </Layouts.Column>
                {businessLineType !== BusinessLineType.residentialWaste ? (
                  <Layouts.Column>
                    <Checkbox
                      name="signatureRequired"
                      value={values.signatureRequired ?? undefined}
                      error={errors.signatureRequired}
                      onChange={handleChange}
                      disabled={!!values.customerJobSiteId || isSubscriptionEdit}
                    >
                      Signature required
                    </Checkbox>
                  </Layouts.Column>
                ) : null}
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
                <Layouts.Margin right="1" as="span">
                  Job Site Pop-up note
                </Layouts.Margin>
                <DescriptiveTooltip
                  position="top"
                  text="Require a pop-up note for order at this job site"
                />
              </Typography>
              <FormInput
                name="popupNote"
                key="popupNote"
                value={values.popupNote ?? undefined}
                error={errors.popupNote}
                onChange={handleChange}
                disabled={!!values.customerJobSiteId || isSubscriptionClosed}
                area
              />
            </Layouts.Column>
          </Layouts.Flex>
        </Subsection>
      </Section>
    </>
  );
};

export default observer(JobSiteSection);
