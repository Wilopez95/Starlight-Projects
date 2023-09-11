import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Checkbox,
  ISelectOption,
  ISelectOptionGroup,
  Layouts,
  Select,
} from '@starlightpro/shared-components';
import { useFormikContext } from 'formik';
import { noop } from 'lodash-es';
import { observer } from 'mobx-react-lite';

import { GlobalService } from '@root/api';
import { CrossIcon, PlusIcon } from '@root/assets';
import { DescriptiveTooltip, FormInput, Section, Subsection, Typography } from '@root/common';
import { OrderTimePicker } from '@root/components';
import { type IContactFormData } from '@root/components/forms/NewContact/types';
import ReminderForm from '@root/components/forms/ReminderConfigurationForm/components/ReminderForm/ReminderForm';
import { NewContactModal, ProjectModal } from '@root/components/modals';
import PurchaseOrderSection from '@root/components/PurchaseOrderSection/PurchaseOrderSection';
import { BusinessLineType } from '@root/consts';
import { convertDates, handleEnterOrSpaceKeyDown } from '@root/helpers';
import { useBoolean, useBusinessContext, useStores, useToggle } from '@root/hooks';
import { useIntl } from '@root/i18n/useIntl';
import { ProjectInfoBlock } from '@root/pages/NewRequest/NewRequestForm/components/infoBlocks';
import { LinkedProjects } from '@root/pages/NewRequest/NewRequestForm/components/linked';
import RouteSelect from '@root/quickViews/components/RouteSelect/RouteSelect';
import { IConfigurableOrder, ICustomerJobSitePair, IProject } from '@root/types';

import styles from '../css/styles.scss';

const requestLimit = 6;

const I18N_PATH = 'quickViews.OrderEdit.RightPanel.sections.JobSite.Text.';

const hasOkToRoll = [BusinessLineType.rollOff, BusinessLineType.portableToilets];

const JobSiteSection: React.FC = () => {
  const { values, errors, handleChange, setFieldValue } = useFormikContext<IConfigurableOrder>();

  const { permitStore, contactStore, projectStore } = useStores();
  const [isProjectSubsectionShown, showProjectSubsection, hideProjectSubsection] = useBoolean();
  const [isNewContactModalOpen, toggleIsNewContactModalOpen] = useToggle();
  const [isProjectModalOpen, toggleProjectModalOpen] = useToggle();
  const linkedData = useRef<ICustomerJobSitePair>();

  const { businessUnitId } = useBusinessContext();
  const { formatPhoneNumber } = useIntl();
  const { t } = useTranslation();

  useEffect(() => {
    permitStore.request({
      businessUnitId: values.businessUnit.id.toString(),
      businessLineId: values.businessLine.id.toString(),
    });
  }, [permitStore, values.businessUnit, values.businessLine]);

  useEffect(() => {
    (async () => {
      linkedData.current = convertDates(
        await GlobalService.getJobSiteCustomerPair(values.jobSiteId, values.customerId),
      );
    })();
  }, [values.customerId, values.jobSiteId]);

  useEffect(() => {
    contactStore.requestByCustomer({ customerId: values.customerId, activeOnly: true });
    if (values.jobSiteContactId) {
      contactStore.requestById(values.jobSiteContactId);
    }
    if (values.orderContactId && values.orderContactId !== values.jobSiteContactId) {
      contactStore.requestById(values.orderContactId);
    }
  }, [contactStore, values.customerId, values.jobSiteContactId, values.orderContactId]);

  useEffect(() => {
    projectStore.cleanup();
    projectStore.unSelectEntity();

    const customerJobSiteId = linkedData?.current?.id;

    if (values.customerId && values.jobSiteId && customerJobSiteId) {
      projectStore.request({
        customerJobSiteId: linkedData?.current?.id,
        limit: requestLimit,
      });
    }
  }, [values.customerId, values.jobSiteId, projectStore, linkedData]);

  const handleProjectFormSubmit = useCallback(
    (data: IProject) => {
      const customerJobSiteId = linkedData?.current?.id;

      if (values.projectId) {
        projectStore.update(data);
      } else if (customerJobSiteId) {
        projectStore.create(
          {
            ...data,
            customerJobSiteId,
          },
          true,
        );
      }
      toggleProjectModalOpen();
    },
    [projectStore, toggleProjectModalOpen, values.projectId, linkedData],
  );

  const handleNewContactFormSubmit = useCallback(
    (data: IContactFormData) => {
      data.phoneNumbers?.forEach(phoneNumber => {
        if (phoneNumber.id === 0) {
          // eslint-disable-next-line
          // @ts-ignore
          delete phoneNumber.id;
        }
      });

      if (values.customerId) {
        contactStore.create(
          {
            ...data,
            active: true,
            customerId: data.temporaryContact ? undefined : values.customerId,
            main: false,
          },
          businessUnitId,
        );
      }
      toggleIsNewContactModalOpen();
    },
    [contactStore, toggleIsNewContactModalOpen, values, businessUnitId],
  );

  const setProjectValue = useCallback(
    (project?: IProject) => {
      setFieldValue('projectId', project?.id ?? null);
    },
    [setFieldValue],
  );

  const permitOptions: ISelectOption[] = permitStore.sortedValues.map(permit => ({
    value: permit.id,
    label: permit.number,
  }));

  const handleKeyDown = (e: React.KeyboardEvent<HTMLOrSVGElement>, callback: () => void) => {
    if (handleEnterOrSpaceKeyDown(e)) {
      callback();
    }
  };

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
            role="button"
            className={styles.contactFooter}
            tabIndex={0}
            onKeyDown={e => handleKeyDown(e, toggleIsNewContactModalOpen)}
          >
            <PlusIcon /> {t(`${I18N_PATH}CreateNewContact`)}
          </Typography>
        ),
        onFooterClick: toggleIsNewContactModalOpen,
      },
    ];
  }, [contactStore.values, t, toggleIsNewContactModalOpen]);

  const phoneNumbers: ISelectOptionGroup[] = useMemo(() => {
    return [
      {
        options: contactStore.values.flatMap(
          contact =>
            contact.phoneNumbers?.map(phoneNumber => ({
              label: formatPhoneNumber(phoneNumber.number) ?? phoneNumber.number,
              value: phoneNumber.id ?? 0,
              hint: contact.name,
            })) ?? [],
        ),
        footer: (
          <Typography
            color="information"
            role="button"
            className={styles.contactFooter}
            tabIndex={0}
            onKeyDown={e => handleKeyDown(e, toggleIsNewContactModalOpen)}
          >
            <PlusIcon /> {t(`${I18N_PATH}CreateNewContact`)}
          </Typography>
        ),
        onFooterClick: toggleIsNewContactModalOpen,
      },
    ];
  }, [contactStore.values, formatPhoneNumber, t, toggleIsNewContactModalOpen]);

  const getPhoneNumber = useCallback(
    (value: string | number): string | undefined =>
      phoneNumbers[0].options.find(contact => contact.value === value)?.label,
    [phoneNumbers],
  );

  const setCallOnWayPhoneNumberAndId = useCallback(
    (name: string, value: string | number): void => {
      const callOnWayPhoneNumber = getPhoneNumber(value);

      setFieldValue(name, value);
      setFieldValue('callOnWayPhoneNumber', callOnWayPhoneNumber);
    },
    [setFieldValue, getPhoneNumber],
  );

  const setTextOnWayPhoneNumberAndId = useCallback(
    (name: string, value: string | number): void => {
      const textOnWayPhoneNumber = getPhoneNumber(value);

      setFieldValue(name, value);
      setFieldValue('textOnWayPhoneNumber', textOnWayPhoneNumber);
    },
    [setFieldValue, getPhoneNumber],
  );

  const handleClear = useCallback(() => {
    setProjectValue();
    showProjectSubsection();
  }, [setProjectValue, showProjectSubsection]);

  const handleRemove = useCallback(() => {
    setProjectValue();
    hideProjectSubsection();
  }, [hideProjectSubsection, setProjectValue]);

  const isChangeNotAllowed = ['completed', 'approved'].includes(values.status);

  const businessLineType = values.businessLine.type;
  const project = values.projectId ? projectStore.getById(values.projectId) : null;

  const handleCreateNewProject = useCallback(() => {
    projectStore.unSelectEntity();
    toggleProjectModalOpen();
  }, [projectStore, toggleProjectModalOpen]);

  return (
    <>
      <ProjectModal
        isOpen={isProjectModalOpen}
        onFormSubmit={handleProjectFormSubmit}
        onClose={toggleProjectModalOpen}
        linkedData={linkedData.current}
        overlayClassName={styles.projectOverlay}
        project={project ?? undefined}
      />
      <NewContactModal
        isOpen={isNewContactModalOpen}
        onFormSubmit={handleNewContactFormSubmit}
        onClose={toggleIsNewContactModalOpen}
      />
      <Section borderless>
        {!values.projectId && !projectStore.loading ? (
          <>
            {isProjectSubsectionShown ? (
              <>
                <Subsection subsectionClassName={styles.linkedProjectsSubsection}>
                  <CrossIcon
                    tabIndex={0}
                    role="button"
                    aria-label={t('Text.Close')}
                    className={styles.closeIcon}
                    onKeyDown={e => handleKeyDown(e, hideProjectSubsection)}
                    onClick={hideProjectSubsection}
                  />
                  <LinkedProjects onProjectSelect={setProjectValue} />
                </Subsection>
                <Subsection>
                  <Typography
                    variant="bodyMedium"
                    color="information"
                    cursor="pointer"
                    role="button"
                    tabIndex={0}
                    onClick={handleCreateNewProject}
                    onKeyDown={e => handleKeyDown(e, handleCreateNewProject)}
                  >
                    <Layouts.Flex alignItems="center">
                      <Layouts.IconLayout height="12px" width="12px">
                        <PlusIcon />
                      </Layouts.IconLayout>
                      {t(`${I18N_PATH}CreateNewProject`)}
                    </Layouts.Flex>
                  </Typography>
                </Subsection>
              </>
            ) : null}
            {!isProjectSubsectionShown ? (
              projectStore.values.length > 0 ? (
                <Subsection>
                  <Typography
                    variant="bodyMedium"
                    color="information"
                    cursor="pointer"
                    role="button"
                    tabIndex={0}
                    onClick={showProjectSubsection}
                    onKeyDown={e => handleKeyDown(e, showProjectSubsection)}
                  >
                    <Layouts.Flex alignItems="center">
                      <Layouts.IconLayout height="12px" width="12px">
                        <PlusIcon />
                      </Layouts.IconLayout>
                      {t(`${I18N_PATH}AddProject`)}
                    </Layouts.Flex>
                  </Typography>
                </Subsection>
              ) : (
                <Subsection>
                  <Typography
                    tabIndex={0}
                    variant="bodyMedium"
                    color="information"
                    cursor="pointer"
                    role="button"
                    onClick={toggleProjectModalOpen}
                    onKeyDown={e => handleKeyDown(e, toggleProjectModalOpen)}
                  >
                    <Layouts.Flex alignItems="center">
                      <Layouts.IconLayout height="12px" width="12px">
                        <PlusIcon />
                      </Layouts.IconLayout>
                      {t(`${I18N_PATH}CreateNewProject`)}
                    </Layouts.Flex>
                  </Typography>
                </Subsection>
              )
            ) : null}
          </>
        ) : null}

        {values.projectId ? (
          <Subsection gray>
            <ProjectInfoBlock
              onClear={handleClear}
              onRemove={handleRemove}
              onConfigure={toggleProjectModalOpen}
              projectId={values.projectId}
            />
          </Subsection>
        ) : null}

        <Subsection>
          <div className={styles.sectionSubtitle}>Customer/Job Site Pair Details</div>
          {!values.noBillableService ? (
            <>
              <Typography
                color="secondary"
                as="label"
                shade="desaturated"
                variant="bodyMedium"
                htmlFor="popupNote"
              >
                Job site pop-up note{' '}
                <DescriptiveTooltip
                  position="top"
                  text={t(`${I18N_PATH}TooltipRequirePopUpNote`)}
                />
              </Typography>

              <FormInput
                name="popupNote"
                key="popupNote"
                value={values.popupNote ?? ''}
                error={errors.popupNote}
                onChange={noop}
                disabled
                area
              />
            </>
          ) : null}
          <Layouts.Flex>
            <Layouts.Column>
              {!values.noBillableService ? (
                <>
                  <Typography
                    color="secondary"
                    as="label"
                    shade="desaturated"
                    variant="bodyMedium"
                    htmlFor="jobSiteContactId"
                  >
                    {/* here */}
                    {`${t(`${I18N_PATH}JobSiteContact`)}* `}
                    <DescriptiveTooltip
                      position="top"
                      text={t(`${I18N_PATH}TooltipContactForDrivers`)}
                    />
                  </Typography>
                  <Select
                    placeholder={t(`${I18N_PATH}SelectJobSiteContact`)}
                    key="jobSiteContactId"
                    name="jobSiteContactId"
                    options={contactOptions}
                    value={values.jobSiteContactId}
                    error={errors.jobSiteContactId}
                    onSelectChange={setFieldValue}
                  />
                  <Select
                    label={t(`${I18N_PATH}CallOnWay`)}
                    placeholder={t(`${I18N_PATH}SelectPhoneNumberForCall`)}
                    name="callOnWayPhoneNumberId"
                    options={phoneNumbers}
                    value={values.callOnWayPhoneNumberId ?? undefined}
                    error={errors.callOnWayPhoneNumberId}
                    onSelectChange={setCallOnWayPhoneNumberAndId}
                  />
                  <Select
                    label={t(`${I18N_PATH}TextOnWay`)}
                    placeholder={t(`${I18N_PATH}SelectPhoneNumberForText`)}
                    name="textOnWayPhoneNumberId"
                    options={phoneNumbers}
                    value={values.textOnWayPhoneNumberId ?? undefined}
                    error={errors.textOnWayPhoneNumberId}
                    onSelectChange={setTextOnWayPhoneNumberAndId}
                  />
                </>
              ) : null}
              <Checkbox
                name="poRequired"
                value={values.poRequired}
                error={errors.poRequired}
                onChange={noop}
                labelClass={styles.checkboxLabel}
                disabled
              >
                {`${t(`${I18N_PATH}PONumberRequired`)} `}
                <DescriptiveTooltip
                  position="top"
                  text={t(`${I18N_PATH}TooltipRequirePurchaseOrder`)}
                />
              </Checkbox>
              <PurchaseOrderSection fullSizeModal customerId={values.customerId} />
              {!values.noBillableService ? (
                <>
                  <Checkbox
                    name="permitRequired"
                    value={values.permitRequired}
                    error={errors.permitRequired}
                    onChange={handleChange}
                    labelClass={styles.checkboxLabel}
                    disabled={values.customerJobSitePairPermitRequired}
                  >
                    Permit required{' '}
                    <DescriptiveTooltip
                      position="top"
                      text={t(`${I18N_PATH}RequirePermitForOrders`)}
                    />
                  </Checkbox>
                  <Select
                    placeholder={t(`${I18N_PATH}SelectPermit`)}
                    ariaLabel="Permit"
                    name="permitId"
                    options={permitOptions}
                    value={values.permitId ?? undefined}
                    error={errors.permitId}
                    onSelectChange={setFieldValue}
                    disabled={values.status !== 'inProgress'}
                  />
                  {businessLineType === BusinessLineType.portableToilets && values.serviceArea ? (
                    <RouteSelect
                      label={t(`${I18N_PATH}PreferredRoute`)}
                      placeholder={t(`${I18N_PATH}SelectPreferredRoute`)}
                      name="workOrder.route"
                      value={values.workOrder?.route ?? undefined}
                      onSelectChange={setFieldValue}
                      serviceDate={values.serviceDate}
                      serviceAreaId={values.serviceArea.originalId ?? values.serviceArea.id}
                      businessLineType={businessLineType}
                      disabled={values.status !== 'inProgress'}
                    />
                  ) : null}
                  <Checkbox
                    name="signatureRequired"
                    value={values.signatureRequired}
                    error={errors.signatureRequired}
                    onChange={handleChange}
                    disabled={values.customerJobSitePairSignatureRequired}
                  >
                    {t(`${I18N_PATH}SignatureRequired`)}
                  </Checkbox>
                </>
              ) : null}
            </Layouts.Column>
            <Layouts.Column>
              {businessLineType === BusinessLineType.portableToilets ? (
                <ReminderForm isAnnualReminder />
              ) : null}
              <FormInput
                label={t(`${I18N_PATH}InstructionsForDriver`)}
                placeholder={t(`${I18N_PATH}AddSomeNotesForDriver`)}
                name="driverInstructions"
                value={`${values.droppedEquipmentItemComment}${values.driverInstructions ?? ''}`}
                error={errors.driverInstructions}
                onChange={handleChange}
                disabled={isChangeNotAllowed}
                area
              />
              {!values.noBillableService ? (
                <>
                  <OrderTimePicker staticMode disabled={isChangeNotAllowed} />
                  <div className={styles.checkboxes}>
                    <Layouts.Flex>
                      <Layouts.Column>
                        <Checkbox
                          name="someoneOnSite"
                          value={values.someoneOnSite}
                          error={errors.someoneOnSite}
                          onChange={handleChange}
                          disabled={isChangeNotAllowed}
                        >
                          {t(`${I18N_PATH}SomeoneOnSite`)}
                        </Checkbox>
                        <Checkbox
                          name="earlyPick"
                          value={values.earlyPick}
                          error={errors.earlyPick}
                          onChange={handleChange}
                          disabled={isChangeNotAllowed}
                        >
                          {t(`${I18N_PATH}EarlyPickupIsOk`)}
                        </Checkbox>
                        <Checkbox
                          name="alleyPlacement"
                          value={values.alleyPlacement}
                          error={errors.alleyPlacement}
                          onChange={handleChange}
                          disabled={isChangeNotAllowed}
                        >
                          {t(`${I18N_PATH}AlleyPlacement`)}
                        </Checkbox>
                      </Layouts.Column>
                      <Layouts.Column>
                        {hasOkToRoll.includes(businessLineType) ? (
                          <Checkbox
                            name="toRoll"
                            value={values.toRoll}
                            error={errors.toRoll}
                            onChange={handleChange}
                            disabled={isChangeNotAllowed}
                          >
                            {t(`${I18N_PATH}OkToRoll`)}
                          </Checkbox>
                        ) : null}
                        <Checkbox
                          name="highPriority"
                          value={values.highPriority}
                          error={errors.highPriority}
                          onChange={handleChange}
                          disabled={isChangeNotAllowed}
                        >
                          {t(`${I18N_PATH}HighPriority`)}
                        </Checkbox>
                        {values.businessLine.type === BusinessLineType.rollOff ? (
                          <Checkbox
                            name="cabOver"
                            value={values.cabOver}
                            error={errors.cabOver}
                            onChange={handleChange}
                            disabled={isChangeNotAllowed}
                          >
                            {t(`${I18N_PATH}CabOver`)}
                          </Checkbox>
                        ) : null}
                      </Layouts.Column>
                    </Layouts.Flex>
                  </div>
                </>
              ) : null}
            </Layouts.Column>
          </Layouts.Flex>
        </Subsection>
      </Section>
    </>
  );
};

export default observer(JobSiteSection);
