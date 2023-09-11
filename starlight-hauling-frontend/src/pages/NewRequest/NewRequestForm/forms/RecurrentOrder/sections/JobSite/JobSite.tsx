import React, { useCallback, useEffect, useMemo } from 'react';
import { Checkbox, ISelectOptionGroup, Layouts, Select } from '@starlightpro/shared-components';
import { useFormikContext } from 'formik';
import { observer } from 'mobx-react-lite';

import { PlusIcon } from '@root/assets';
import { FormInput, Section, Subsection, Tooltip, Typography } from '@root/common';
import { type IContactFormData } from '@root/components/forms/NewContact/types';
import { NewContactModal } from '@root/components/modals';
import { ClientRequestType } from '@root/consts';
import { BusinessLineType } from '@root/consts/businessLine';
import { useBusinessContext, usePermission, useStores, useToggle } from '@root/hooks';

import { INewRecurrentOrder } from '../../types';

const businessLinesList = [BusinessLineType.rollOff, BusinessLineType.portableToilets];

const JobSiteSection: React.FC = () => {
  const { values, errors, handleChange, setFieldValue } = useFormikContext<INewRecurrentOrder>();

  const { contactStore, customerStore, businessLineStore } = useStores();
  const [isNewContactModalOpen, toggleIsNewContactModalOpen] = useToggle();
  const canCreateContacts = usePermission('customers:contacts:perform');

  const selectedCustomer = customerStore.selectedEntity;
  const businessLineType = businessLineStore.getById(values.businessLineId)?.type;

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

  const contactOptions: ISelectOptionGroup[] = useMemo(() => {
    return [
      {
        options: contactStore.values.map(contact => ({
          label: contact.name,
          value: contact.id,
          hint: contact.jobTitle ?? '',
        })),
        footer: canCreateContacts ? (
          <Typography color="information" cursor="pointer" variant="bodyMedium">
            <Layouts.IconLayout width="12px" height="12px">
              <PlusIcon />
            </Layouts.IconLayout>
            Create new contact
          </Typography>
        ) : undefined,
        onFooterClick: canCreateContacts ? toggleIsNewContactModalOpen : undefined,
      },
    ];
  }, [canCreateContacts, contactStore.values, toggleIsNewContactModalOpen]);

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
          {values.type === ClientRequestType.NonServiceOrder ? (
            <Layouts.Margin bottom="1">
              <Checkbox
                name="pair.poRequired"
                value={values.pair.poRequired}
                error={errors.pair?.poRequired}
                onChange={handleChange}
                disabled={!!values.customerJobSiteId}
              >
                PO number required
              </Checkbox>
            </Layouts.Margin>
          ) : (
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
                  <Tooltip border position="top" text="Contact for drivers to call on way" inline>
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
                <Select
                  placeholder="Select job site contact"
                  key="jobSiteContactId"
                  name="jobSiteContactId"
                  options={contactOptions}
                  value={values.jobSiteContactId}
                  error={errors.jobSiteContactId}
                  onSelectChange={setFieldValue}
                />
                <Layouts.Flex>
                  <Layouts.Column>
                    <Layouts.Margin bottom="1">
                      <Checkbox
                        name="pair.poRequired"
                        value={values.pair.poRequired}
                        error={errors.pair?.poRequired}
                        onChange={handleChange}
                        disabled={!!values.customerJobSiteId}
                      >
                        PO number required
                      </Checkbox>
                    </Layouts.Margin>

                    {businessLineType && businessLinesList.includes(businessLineType) ? (
                      <Checkbox
                        name="pair.permitRequired"
                        value={values.pair.permitRequired ?? undefined}
                        error={errors.pair?.permitRequired}
                        onChange={handleChange}
                        disabled={!!values.customerJobSiteId}
                      >
                        Permit required
                      </Checkbox>
                    ) : null}
                  </Layouts.Column>
                  {businessLineType !== BusinessLineType.residentialWaste ? (
                    <Layouts.Column>
                      <Checkbox
                        name="pair.signatureRequired"
                        value={values.pair.signatureRequired ?? undefined}
                        error={errors.pair?.signatureRequired}
                        onChange={handleChange}
                        disabled={!!values.customerJobSiteId}
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
                  htmlFor="pair.popupNote"
                >
                  <Layouts.Margin right="1" as="span">
                    Job Site Pop-up note
                  </Layouts.Margin>
                  <Tooltip
                    border
                    position="top"
                    inline
                    text="Require a pop-up note for order at this job site"
                  >
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
                  name="pair.popupNote"
                  value={values.pair.popupNote ?? undefined}
                  error={errors.pair?.popupNote}
                  onChange={handleChange}
                  disabled={!!values.customerJobSiteId}
                  area
                />
              </Layouts.Column>
            </Layouts.Flex>
          )}
        </Subsection>
      </Section>
    </>
  );
};

export default observer(JobSiteSection);
