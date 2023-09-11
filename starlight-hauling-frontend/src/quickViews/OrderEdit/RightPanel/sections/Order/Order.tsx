import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import * as Sentry from '@sentry/react';
import {
  Autocomplete,
  Calendar,
  IAutocompleteConfig,
  ISelectOption,
  ISelectOptionGroup,
  Layouts,
  Select,
} from '@starlightpro/shared-components';
import { endOfDay, isBefore, startOfTomorrow } from 'date-fns';
import { useFormikContext } from 'formik';
import { observer } from 'mobx-react-lite';

import {
  GlobalService,
  IOrderRatesCalculateRequest,
  IOrderSelectCustomRatesResponse,
  IOrderSelectGlobalRatesResponse,
  JobSiteService,
  MaterialService,
  EquipmentItemService,
  OrderService,
} from '@root/api';
import { AssignIcon, DeleteIcon, PlusIcon, ReminderIcon } from '@root/assets';
import {
  AutocompleteTemplates,
  DescriptiveTooltip,
  FormInput,
  Section,
  Subsection,
  Typography,
} from '@root/common';
import { IJobSiteData } from '@root/components/forms/JobSite/types';
import { IContactFormData } from '@root/components/forms/NewContact/types';
import { JobSiteModal, NewContactModal } from '@root/components/modals';
import { BillableItemActionEnum, BusinessLineType } from '@root/consts';
import {
  addressFormat,
  billableServiceToSelectOption,
  getGlobalPriceType,
  getMaterialsForOptions,
  getPriceType,
  getCurrentOrderTotal,
  handleEnterOrSpaceKeyDown,
  NotificationHelper,
} from '@root/helpers';
import { useDateIntl } from '@root/helpers/format/date';
import { useBusinessContext, useStores, useToggle } from '@root/hooks';
import { useIntl } from '@root/i18n/useIntl';
import { isCustomPriceGroup } from '@root/pages/NewRequest/NewRequestForm/guards';
import {
  LineItemsSection,
  ManifestItemsSection,
  ThresholdsSection,
} from '@root/quickViews/components/OrderQuickViewSections';
import { sanitizeJobSite } from '@root/stores/jobSite/sanitize';
import { IConfigurableOrder } from '@root/types';
import { AddressSuggestion } from '@root/types/responseEntities';

import { ApiError } from '@root/api/base/ApiError';
import { ActionCode } from '@root/helpers/notifications/types';
import { IOrderEditRightPanel } from '../../types';

import styles from '../css/styles.scss';

const materialService = new MaterialService();
const equipmentItemService = new EquipmentItemService();
const jobSiteService = new JobSiteService();

const assignEquipmentItemServiceList = [
  BillableItemActionEnum.switch,
  BillableItemActionEnum.final,
  BillableItemActionEnum.dumpReturn,
  BillableItemActionEnum.relocate,
  BillableItemActionEnum.reposition,
];

const notificationServiceList = [
  BillableItemActionEnum.switch,
  BillableItemActionEnum.final,
  BillableItemActionEnum.dumpReturn,
  BillableItemActionEnum.liveLoad,
];

const materialProfileList = [
  BillableItemActionEnum.switch,
  BillableItemActionEnum.final,
  BillableItemActionEnum.dumpReturn,
  BillableItemActionEnum.liveLoad,
];

const OrderSection: React.FC<IOrderEditRightPanel> = ({ onRateRequest }) => {
  const {
    materialStore,
    billableServiceStore,
    lineItemStore,
    equipmentItemStore,
    brokerStore,
    disposalSiteStore,
    contactStore,
    customerStore,
    globalRateStore,
    thirdPartyHaulerStore,
    materialProfileStore,
    priceGroupStore,
    orderStore,
    thresholdStore,
    surchargeStore,
    i18nStore,
  } = useStores();

  const selectedOrder = orderStore.selectedEntity;

  const [materialOptions, setMaterialOptions] = useState<ISelectOption[]>([]);

  const [isNewContactModalOpen, toggleIsNewContactModalOpen] = useToggle();
  const [isJobSiteModalOpen, toggleJobSiteModalOpen] = useToggle();
  const { t } = useTranslation();

  const { values, errors, handleChange, setFieldValue, setFormikState } =
    useFormikContext<IConfigurableOrder>();

  const currentOrder = orderStore.selectedEntity;
  const { businessUnitId } = useBusinessContext();
  const { firstDayOfWeek } = useIntl();

  useEffect(() => {
    const equipmentItemId = values.equipmentItemId ?? values.billableService?.equipmentItemId;
    const selectedOrderEntity = orderStore.selectedEntity;

    if (!equipmentItemId || !selectedOrderEntity) {
      return;
    }

    (async () => {
      const { materialOptions: materialOptionElement, selectedMaterial } =
        await getMaterialsForOptions({
          materialService,
          businessLineId: values.businessLine.id,
          equipmentItemId,
          materialId: values.materialId ?? undefined,
        });

      setFieldValue('material', selectedMaterial);
      setMaterialOptions(materialOptionElement);
    })();
  }, [
    orderStore.selectedEntity,
    values.billableService?.equipmentItemId,
    values.businessLine.id,
    values.equipmentItemId,
    values.materialId,
    setFieldValue,
  ]);

  useEffect(() => {
    const { newOrderTotal, surchargesTotal } = getCurrentOrderTotal({
      values,
      region: i18nStore.region,
      surcharges: surchargeStore.values,
      commercialTaxesUsed: !!selectedOrder?.commercialTaxesUsed,
    });

    setFieldValue('grandTotal', newOrderTotal);
    setFieldValue('surchargesTotal', surchargesTotal);
  }, [
    values,
    i18nStore.region,
    selectedOrder?.commercialTaxesUsed,
    setFieldValue,
    surchargeStore.values,
  ]);

  const businessLineId = values.businessLine.id.toString();

  const selectedGroup = useRef<
    IOrderSelectCustomRatesResponse | IOrderSelectGlobalRatesResponse | null
  >(null);

  const isAssignEquipmentItemAllowed =
    values.billableService &&
    assignEquipmentItemServiceList.includes(values.billableService.action);

  const isNotificationAllowed =
    values.billableService && notificationServiceList.includes(values.billableService.action);

  const isNotificationDisabled = isBefore(values.serviceDate, startOfTomorrow());

  const generateDriverInstructionsTemplate = (droppedEquipmentItem: string | null) =>
    droppedEquipmentItem ? `Pick up Equipment #${droppedEquipmentItem}. ` : '';

  const billableServiceOptions = billableServiceStore.sortedValues.map(billableItem =>
    billableServiceToSelectOption(
      billableItem,
      equipmentItemStore.getById(billableItem.equipmentItemId),
    ),
  );

  const handleReminderKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLOrSVGElement>) => {
      if (handleEnterOrSpaceKeyDown(e)) {
        setFieldValue('notificationApplied', true);
      }
    },
    [setFieldValue],
  );

  useEffect(() => {
    setFieldValue(
      'droppedEquipmentItemComment',
      generateDriverInstructionsTemplate(values.droppedEquipmentItem),
    );
  }, [setFieldValue, values.droppedEquipmentItem]);

  useEffect(() => {
    if (values.droppedEquipmentItemComment.trim() === values.driverInstructions?.trim()) {
      setFieldValue('droppedEquipmentItemComment', '');
    }
  }, [
    setFieldValue,
    values.driverInstructions,
    values.droppedEquipmentItem,
    values.droppedEquipmentItemComment,
  ]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLOrSVGElement>, callback: () => void) => {
    if (handleEnterOrSpaceKeyDown(e)) {
      callback();
    }
  };

  const handleAssignEquipmentItemClear = useCallback(() => {
    setFieldValue('droppedEquipmentItem', null);
    setFieldValue('droppedEquipmentItemComment', '');
    setFieldValue('droppedEquipmentItemApplied', false);
  }, [setFieldValue]);

  const handleReminderClear = useCallback(() => {
    setFieldValue('notifyDayBefore', null);
    setFieldValue('notificationApplied', false);
  }, [setFieldValue]);

  useEffect(() => {
    billableServiceStore.cleanup();
    lineItemStore.cleanup();
    equipmentItemStore.cleanup();
    brokerStore.cleanup();
    disposalSiteStore.cleanup();
    thirdPartyHaulerStore.cleanup();
    thresholdStore.cleanup();
    priceGroupStore.cleanup();
    materialProfileStore.cleanup();
    materialStore.cleanup();
    contactStore.cleanup();

    billableServiceStore.request({ businessLineId, activeOnly: true });
    lineItemStore.request({ businessLineId, activeOnly: true });
    equipmentItemStore.request({ businessLineId, activeOnly: true });
    brokerStore.request({ activeOnly: true });
    disposalSiteStore.request({ activeOnly: true });
    thirdPartyHaulerStore.request({ activeOnly: true });
    thresholdStore.request({ businessLineId, activeOnly: true });
    priceGroupStore.request({ businessUnitId, businessLineId });
    materialProfileStore.request({ activeOnly: true, disposals: true, businessLineId });
    materialStore.request({ activeOnly: true, businessLineId });
    if (values.customerId) {
      contactStore.requestByCustomer({ customerId: values.customerId, activeOnly: true });
    }
  }, [
    businessLineId,
    businessUnitId,
    brokerStore,
    equipmentItemStore,
    lineItemStore,
    disposalSiteStore,
    contactStore,
    customerStore.selectedEntity,
    thirdPartyHaulerStore,
    materialProfileStore,
    values.customerId,
    priceGroupStore,
    thresholdStore,
    values.billableService,
    materialStore,
    billableServiceStore,
  ]);

  const handleNewContactFormSubmit = useCallback(
    (data: IContactFormData) => {
      data.phoneNumbers?.forEach(phoneNumber => {
        if (phoneNumber.id === 0) {
          // TODO: fix it later
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

  useEffect(() => {
    (async () => {
      try {
        const group = await OrderService.selectRatesGroup({
          businessUnitId,
          businessLineId,
          customerId: values.customerId,
          customerJobSiteId: values.customerJobSiteId,
          date: values.serviceDate,
          serviceAreaId: values.serviceArea?.originalId,
        });

        selectedGroup.current = group;
      } catch (error) {
        selectedGroup.current = null;
        NotificationHelper.error('default');
      }
    })();
  }, [
    businessUnitId,
    businessLineId,
    setFieldValue,
    values.customerId,
    values.jobSiteId,
    values.serviceDate,
    values.serviceArea?.originalId,
    values.customerJobSiteId,
  ]);

  const handleBillableItemChange = useCallback(
    async (billableItemName: string, billableItemValue: number) => {
      if (billableItemName === 'billableServiceId' && billableItemValue) {
        const billableService = await billableServiceStore.requestHistoricalById(billableItemValue);
        const equipmentItemId = billableService?.equipmentItemId;
        const equipmentHistorical = await equipmentItemService.getEquipmentItemHistocal(
          equipmentItemId,
        );

        setFieldValue('billableService', billableService);
        setFieldValue('equipmentItem', equipmentHistorical);

        setFormikState(state => ({
          ...state,
          values: {
            ...state.values,
            [billableItemName]: billableItemValue,
            jobSite2Id: undefined,
            materialId: null,
            materialProfileId: undefined,
            disposalSiteId: null,
            notifyDayBefore: null,
            equipmentItemId: equipmentItemId ?? null,
            billableServicePrice: 0,
            billableServiceApplySurcharges: billableService?.applySurcharges,
          },
        }));

        setFormikState(state => ({
          ...state,
          values: {
            ...state.values,
            droppedEquipmentItem: null,
            droppedEquipmentItemApplied: false,
            notificationApplied: false,
          },
        }));
      }

      if (billableItemName === 'materialId') {
        setFormikState(state => ({
          ...state,
          values: {
            ...state.values,
            [billableItemName]: billableItemValue,
            materialProfileId: undefined,
            disposalSiteId: null,
          },
        }));
      }

      if (
        selectedGroup.current &&
        ((values.billableServiceId && billableItemName === 'materialId') ||
          (values.materialId && billableItemName === 'billableServiceId'))
      ) {
        const group = selectedGroup.current;
        const billableServiceId =
          billableItemName === 'billableServiceId' ? billableItemValue : values.billableServiceId;
        const materialId =
          billableItemName === 'materialId' ? billableItemValue : values.materialId;

        const billableService = billableServiceStore.getById(billableServiceId);

        if (
          group &&
          ((billableItemName === 'billableServiceId' && !billableService?.materialBasedPricing) ||
            (billableItemName === 'materialId' &&
              billableService?.materialBasedPricing &&
              billableItemValue))
        ) {
          const payload: IOrderRatesCalculateRequest = {
            businessUnitId: +businessUnitId,
            businessLineId: +businessLineId,
            type: values.customRatesGroupId === 0 ? 'global' : group.level,
            billableService: {
              billableServiceId: billableServiceId ?? undefined,
              equipmentItemId: billableService?.equipmentItemId,
              materialId: billableService?.materialBasedPricing ? materialId : null,
            },
          };

          if (group.level === 'custom' && values.customRatesGroupId !== 0) {
            payload.customRatesGroupId = values.customRatesGroupId ?? undefined;
          }

          if (billableService) {
            try {
              const rates = await OrderService.calculateRates(payload);

              if (rates) {
                const global = rates.globalRates;
                const custom = rates.customRates;

                if (custom?.customRatesService) {
                  const params = {
                    entityType: 'customRatesServices',
                    billableServiceId: custom?.customRatesService?.billableServiceId,
                    businessLineId: custom?.customRatesService?.businessLineId,
                    businessUnitId: custom?.customRatesService?.businessUnitId,
                    equipmentItemId: custom?.customRatesService?.equipmentItemId,
                    materialId: custom?.customRatesService?.materialId,
                    customRatesGroupId: custom?.customRatesService?.customRatesGroupId,
                  };
                  const customRate = await OrderService.getHistoricalRates(params);
                  const customRateService = customRate[0];

                  setFieldValue('customRatesGroupServicesId', customRateService.id);
                } else {
                  const params = {
                    entityType: 'globalRatesServices',
                    billableServiceId: global?.globalRatesService?.billableServiceId,
                    businessLineId: global?.globalRatesService?.businessLineId,
                    businessUnitId: global?.globalRatesService?.businessUnitId,
                    equipmentItemId: global?.globalRatesService?.equipmentItemId,
                    materialId: global?.globalRatesService?.materialId,
                  };
                  const globalRate = await OrderService.getHistoricalRates(params);
                  const globalRateService = globalRate[0];

                  setFieldValue('globalRatesServicesId', globalRateService.id);
                }

                const billablePrice =
                  custom?.customRatesService?.price.toFixed(2) ??
                  global?.globalRatesService?.price?.toFixed(2);

                setFieldValue('billableServicePrice', billablePrice);

                setFieldValue('billableServiceTotal', billablePrice);

                setFieldValue('beforeTaxesTotal', billablePrice);

                setFieldValue('globalRatesSurcharges', global?.globalRatesSurcharges);
                setFieldValue('customRatesSurcharges', custom?.customRatesSurcharges);
              }
            } catch (error: unknown) {
              const typedError = error as ApiError;
              NotificationHelper.error(
                'calculateServiceRates',
                typedError?.response?.code as ActionCode,
              );
              Sentry.addBreadcrumb({
                category: 'Order',
                message: `Order Rates Calculation Error ${JSON.stringify(typedError?.message)}`,
                data: {
                  ...payload,
                },
              });
              Sentry.captureException(typedError);
            }
          }
        }
      }

      setFieldValue(billableItemName, billableItemValue);
    },
    [
      billableServiceStore,
      businessLineId,
      businessUnitId,
      setFieldValue,
      setFormikState,
      values.billableServiceId,
      values.customRatesGroupId,
      values.materialId,
    ],
  );

  const handleMaterialProfileChange = useCallback(
    (name: string, value: number) => {
      const disposalSiteId = materialProfileStore.getById(value)?.disposalSiteId;

      setFormikState(state => ({
        ...state,
        values: {
          ...state.values,
          [name]: value,
          disposalSiteId: disposalSiteId ?? null,
        },
      }));
    },
    [materialProfileStore, setFormikState],
  );

  const handleJobSite2AutocompleteSelect = useCallback(
    (item: AddressSuggestion) => {
      setFieldValue('searchString', '');
      setFieldValue(
        'jobSite2Label',
        addressFormat({
          ...item,
          addressLine1: item.address,
          addressLine2: '',
          region: i18nStore.region,
        }),
      );
      setFieldValue('jobSite2Id', item.id);
    },
    [i18nStore.region, setFieldValue],
  );

  const handleJobSite2Clear = useCallback(() => {
    setFieldValue('searchString', '');
    setFieldValue('jobSite2Label', undefined);
    setFieldValue('jobSite2Id', undefined);
  }, [setFieldValue]);

  const handleJobSite2FormSubmit = useCallback(
    async (newJobSite: IJobSiteData) => {
      try {
        sanitizeJobSite(newJobSite);
        const jobSite = await jobSiteService.create(newJobSite);

        if (jobSite) {
          setFieldValue('jobSite2Label', addressFormat(jobSite.address));
          setFieldValue('searchString', '');
          setFieldValue('jobSite2Id', jobSite.id);
        }

        NotificationHelper.success('create', 'Job Site');
      } catch (error: unknown) {
        const typedError = error as ApiError;
        NotificationHelper.error('create', typedError.response.code as ActionCode, 'Job Site');
      } finally {
        toggleJobSiteModalOpen();
      }
    },
    [setFieldValue, toggleJobSiteModalOpen],
  );

  const handleStartDateChange = useCallback(
    async (name: string, date: Date | null) => {
      setFieldValue(name, date ?? undefined);
      try {
        const group = await OrderService.selectRatesGroup({
          businessUnitId,
          businessLineId,
          customerId: values.customerId,
          customerJobSiteId: values.customerJobSiteId,
          date: date ?? values.serviceDate,
          serviceAreaId: values.serviceArea?.originalId,
        });

        selectedGroup.current = group;

        if (isCustomPriceGroup(group)) {
          setFieldValue('customRatesGroupId', group.selectedId);
        }
      } catch (error) {
        selectedGroup.current = null;
        NotificationHelper.error('default');
      }
    },
    [
      businessLineId,
      businessUnitId,
      setFieldValue,
      values.customerId,
      values.customerJobSiteId,
      values.serviceArea?.originalId,
      values.serviceDate,
    ],
  );

  const materialProfileOptions: ISelectOption[] = useMemo(() => {
    return [
      {
        label: 'Ignore Material Profile',
        value: 0,
      },
      ...materialProfileStore.sortedValues
        .filter(x => x.materialId === values.materialId)
        .map(materialProfile => ({
          label: materialProfile.description,
          value: materialProfile.id,
        })),
    ];
  }, [materialProfileStore.sortedValues, values.materialId]);

  const getPriceGroupOptions = (): ISelectOption[] => {
    const options: ISelectOption[] = values.customRatesGroup
      ? [
          {
            value: values.customRatesGroup?.originalId,
            label: values.customRatesGroup?.description,
          },
        ]
      : [];

    if (selectedGroup.current?.level === 'custom') {
      const selectedGroupsOptions = selectedGroup.current.customRatesGroups.map(
        customRatesGroup => {
          return {
            label: customRatesGroup.description,
            value: customRatesGroup.id,
            hint: getPriceType(customRatesGroup, t),
          };
        },
      );

      options.push(...selectedGroupsOptions);
    }

    options.push({
      label: globalRateStore.values[0].description,
      value: globalRateStore.values[0].id,
      hint: getGlobalPriceType(t),
    });

    return options;
  };

  const disposalSiteOptions: ISelectOption[] = disposalSiteStore.sortedValues.map(disposalSite => ({
    label: disposalSite.description,
    value: disposalSite.id,
  }));

  const thirdPartyHaulerOptions: ISelectOption[] = thirdPartyHaulerStore.sortedValues
    .filter(option => option.active)
    .map(hauler => ({
      label: hauler.description,
      value: hauler.id,
    }));

  const contactOptions: ISelectOptionGroup[] = useMemo(() => {
    const options: ISelectOption[] = contactStore.values.map(contact => ({
      label: contact.name,
      value: contact.id,
      hint: contact.jobTitle,
    }));

    options.unshift({
      label: 'Use job site contact',
      value: 0,
    });

    return [
      {
        options,
        footer: (
          <Typography
            color="information"
            role="button"
            className={styles.contactFooter}
            tabIndex={0}
            onKeyDown={e => handleKeyDown(e, toggleIsNewContactModalOpen)}
          >
            <PlusIcon /> Create new contact
          </Typography>
        ),
        onFooterClick: toggleIsNewContactModalOpen,
      },
    ];
  }, [contactStore.values, toggleIsNewContactModalOpen]);

  const priceGroupOptions = getPriceGroupOptions();

  const currentBillableService = billableServiceStore.getById(values.billableServiceId);

  const materialProfileSection = useMemo(() => {
    const material = materialStore.getById(values.materialId);
    const billableServiceAction = currentBillableService?.action;

    return (
      material?.manifested &&
      billableServiceAction &&
      materialProfileList.includes(billableServiceAction) && (
        <Select
          label="Material Profile*"
          placeholder="Select material profile"
          name="materialProfileId"
          options={materialProfileOptions}
          value={values.materialProfileId ?? undefined}
          error={errors.materialProfileId}
          onSelectChange={handleMaterialProfileChange}
        />
      )
    );
  }, [
    currentBillableService,
    errors.materialProfileId,
    handleMaterialProfileChange,
    materialProfileOptions,
    materialStore,
    values.materialId,
    values.materialProfileId,
  ]);

  const disposalSiteSection = useMemo(() => {
    const billableServiceAction = currentBillableService?.action;

    switch (billableServiceAction) {
      case 'final':
      case 'switch':
      case 'liveLoad':
      case 'dump&Return':
        return (
          <Select
            label="Disposal Site"
            placeholder="Select disposal site"
            name="disposalSiteId"
            options={disposalSiteOptions}
            value={values.disposalSiteId ?? undefined}
            error={errors.disposalSiteId}
            onSelectChange={setFieldValue}
            disabled={!!values.materialProfileId}
          />
        );
      default:
        return null;
    }
  }, [
    currentBillableService?.action,
    disposalSiteOptions,
    errors.disposalSiteId,
    setFieldValue,
    values.disposalSiteId,
    values.materialProfileId,
  ]);

  const jobSite2Section = useMemo(() => {
    const billableServiceAction = currentBillableService?.action;

    if (
      billableServiceAction === 'relocate' &&
      values.businessLine.type !== BusinessLineType.portableToilets &&
      values.status === 'inProgress'
    ) {
      const jobSiteAutocompleteConfigs: IAutocompleteConfig[] = [
        {
          name: 'jobSites',
          showFooterIfNoOption: true,
          onSelect: handleJobSite2AutocompleteSelect,
          onFooterClick: toggleJobSiteModalOpen,
          template: <AutocompleteTemplates.JobSite />,
          footer: <AutocompleteTemplates.Footer text="Create new job site" />,
        },
      ];

      return (
        <Autocomplete
          name="searchString"
          label="Relocation Address"
          placeholder="Search job sites"
          search={values.searchString}
          onSearchChange={setFieldValue}
          onClear={handleJobSite2Clear}
          selectedValue={values.jobSite2Label}
          onRequest={search => GlobalService.multiSearch(search, businessUnitId)}
          configs={jobSiteAutocompleteConfigs}
          error={errors.jobSite2Id}
        />
      );
    }

    return null;
  }, [
    businessUnitId,
    currentBillableService?.action,
    errors.jobSite2Id,
    handleJobSite2AutocompleteSelect,
    handleJobSite2Clear,
    setFieldValue,
    toggleJobSiteModalOpen,
    values.jobSite2Label,
    values.searchString,
    values.status,
    values.businessLine.type,
  ]);

  const isServiceDateChangeNotAllowed =
    ['completed', 'approved', 'inProgress'].includes(values.status) && !values.noBillableService;
  const isServiceChangeNotAllowed =
    ['completed', 'approved'].includes(values.status) ||
    (values.status === 'inProgress' && isBefore(endOfDay(values.serviceDate), startOfTomorrow()));

  const notifyOptions = useMemo((): ISelectOption[] => {
    const orderContact = contactStore.getById(values.orderContactId);
    const jobSiteContact = contactStore.getById(values.jobSiteContactId);
    const isContactTheSame = values.orderContactId === 0;

    const isEmailDisabled = isContactTheSame ? !jobSiteContact?.email : !orderContact?.email;
    const isPhoneDisabled = isContactTheSame
      ? !jobSiteContact?.phoneNumbers?.length
      : !orderContact?.phoneNumbers?.length;

    return [
      {
        value: 'byText',
        label: 'Notify day before by text',
        disabled: isPhoneDisabled,
      },
      {
        value: 'byEmail',
        label: 'Notify day before by email',
        disabled: isEmailDisabled,
      },
    ];
  }, [contactStore, values.jobSiteContactId, values.orderContactId]);
  const { dateFormat } = useDateIntl();

  return (
    <>
      <JobSiteModal
        isOpen={isJobSiteModalOpen}
        onFormSubmit={handleJobSite2FormSubmit}
        onClose={toggleJobSiteModalOpen}
        withMap={false}
        overlayClassName={styles.modalOverlay}
      />
      <NewContactModal
        isOpen={isNewContactModalOpen}
        onFormSubmit={handleNewContactFormSubmit}
        onClose={toggleIsNewContactModalOpen}
        overlayClassName={styles.modalOverlay}
      />
      <Section borderless>
        <Subsection>
          <Layouts.Margin bottom="1">
            <Typography variant="headerThree">Order</Typography>
          </Layouts.Margin>
          <Layouts.Flex>
            <Layouts.Column>
              {values.status !== 'inProgress' && currentOrder?.thirdPartyHauler?.originalId ? (
                <Select
                  label="3rd Party Hauler"
                  placeholder="Select hauler"
                  name="thirdPartyHaulerId"
                  value={values.thirdPartyHaulerId ?? undefined}
                  options={thirdPartyHaulerOptions}
                  error={errors.thirdPartyHaulerId}
                  onSelectChange={setFieldValue}
                />
              ) : null}

              <Calendar
                label="Service date"
                name="serviceDate"
                withInput
                error={errors.serviceDate}
                placeholder={t('Text.SetDate')}
                firstDayOfWeek={firstDayOfWeek}
                dateFormat={dateFormat}
                value={values.serviceDate}
                onDateChange={handleStartDateChange}
                readOnly={isServiceDateChangeNotAllowed}
              />

              <Select
                label="Price group*"
                placeholder="Select price group"
                name="customRatesGroupId"
                options={priceGroupOptions}
                value={values.customRatesGroupId ?? undefined}
                error={errors.customRatesGroupId}
                onSelectChange={setFieldValue}
              />
            </Layouts.Column>
            <Layouts.Column>
              {!values.noBillableService ? (
                <>
                  <Select
                    label="Order contact*"
                    placeholder="Select contact"
                    name="orderContactId"
                    options={contactOptions}
                    value={values.orderContactId}
                    error={errors.orderContactId}
                    onSelectChange={setFieldValue}
                  />

                  {jobSite2Section}

                  {materialProfileSection}

                  {disposalSiteSection}
                </>
              ) : null}
            </Layouts.Column>
          </Layouts.Flex>
        </Subsection>
        {!values.noBillableService ? (
          <Subsection>
            <Layouts.Margin bottom="2">
              <Typography variant="headerFour">Service</Typography>
            </Layouts.Margin>
            <Layouts.Flex>
              <Layouts.Margin right="3">
                <Layouts.Box minWidth="276px" width="100%">
                  <Select
                    label="Service*"
                    placeholder="Select service"
                    name="billableServiceId"
                    value={values.billableServiceId ?? undefined}
                    error={errors.billableServiceId}
                    onSelectChange={handleBillableItemChange}
                    options={billableServiceOptions}
                    disabled={isServiceChangeNotAllowed}
                  />
                </Layouts.Box>
              </Layouts.Margin>
              <Layouts.Margin right="3">
                <Layouts.Box minWidth="276px" width="100%">
                  <Select
                    label="Material*"
                    placeholder="Select material"
                    name="materialId"
                    value={values.materialId ?? undefined}
                    error={errors.materialId}
                    onSelectChange={handleBillableItemChange}
                    options={materialOptions}
                  />
                </Layouts.Box>
              </Layouts.Margin>
              <Layouts.Box minWidth="90px" width="50%">
                <FormInput
                  label="Price*"
                  type="number"
                  name="billableServicePrice"
                  key="billableServicePrice"
                  value={values.billableServicePrice}
                  onChange={handleChange}
                  error={errors.billableServicePrice}
                  disabled={!values.unlockOverrides}
                />
              </Layouts.Box>
            </Layouts.Flex>
            <Layouts.Flex>
              {!values.notificationApplied && isNotificationAllowed ? (
                <Layouts.Margin right="3">
                  <Layouts.Box minWidth="276px">
                    <Layouts.Flex>
                      <Typography
                        onClick={() => setFieldValue('notificationApplied', true)}
                        onKeyDown={handleReminderKeyDown}
                        tabIndex={0}
                        role="button"
                        color="information"
                        variant="bodyMedium"
                        cursor="pointer"
                      >
                        <Layouts.Flex alignItems="center">
                          <Layouts.IconLayout>
                            <ReminderIcon />
                          </Layouts.IconLayout>
                          Set a reminder
                        </Layouts.Flex>
                      </Typography>
                    </Layouts.Flex>
                  </Layouts.Box>
                </Layouts.Margin>
              ) : null}
              {isNotificationAllowed && values.notificationApplied ? (
                <Layouts.Margin right="3">
                  <Layouts.Box minWidth="276px">
                    <Layouts.Flex alignItems="center">
                      <Layouts.IconLayout remove onClick={handleReminderClear}>
                        <DeleteIcon
                          role="button"
                          aria-label="Delete"
                          tabIndex={0}
                          onKeyDown={(e: React.KeyboardEvent<HTMLOrSVGElement>) =>
                            handleKeyDown(e, handleReminderClear)
                          }
                        />
                      </Layouts.IconLayout>
                      <Layouts.Box width="100%">
                        <Layouts.Padding top="0.5" bottom="0.5">
                          <Typography
                            color="secondary"
                            as="label"
                            shade="desaturated"
                            variant="bodyMedium"
                            htmlFor="notifyDayBefore"
                          >
                            <Layouts.Margin as="span" right="0.5">
                              Service reminder
                            </Layouts.Margin>
                            <DescriptiveTooltip
                              position="top"
                              text="A reminder will be sent to order contact. Options with missing credentials are unavailable"
                            />
                          </Typography>
                        </Layouts.Padding>

                        <Select
                          placeholder="Select service reminder"
                          name="notifyDayBefore"
                          value={values.notifyDayBefore ?? undefined}
                          error={errors.notifyDayBefore}
                          onSelectChange={setFieldValue}
                          disabled={isNotificationDisabled}
                          options={notifyOptions}
                        />
                      </Layouts.Box>
                    </Layouts.Flex>
                  </Layouts.Box>
                </Layouts.Margin>
              ) : null}
              {values.droppedEquipmentItemApplied && isAssignEquipmentItemAllowed ? (
                <Layouts.Margin right="3">
                  <Layouts.Box minWidth="276px">
                    <Layouts.Flex alignItems="center">
                      <Layouts.IconLayout remove onClick={handleAssignEquipmentItemClear}>
                        <DeleteIcon
                          role="button"
                          aria-label="Delete"
                          tabIndex={0}
                          onKeyDown={(e: React.KeyboardEvent<HTMLOrSVGElement>) =>
                            handleKeyDown(e, handleAssignEquipmentItemClear)
                          }
                        />
                      </Layouts.IconLayout>
                      <FormInput
                        label="Assign Equipment*"
                        placeholder="Select assign equipment"
                        name="droppedEquipmentItem"
                        value={values.droppedEquipmentItem ?? undefined}
                        error={errors.droppedEquipmentItem}
                        onChange={handleChange}
                      />
                    </Layouts.Flex>
                  </Layouts.Box>
                </Layouts.Margin>
              ) : null}
              {!values.droppedEquipmentItemApplied && isAssignEquipmentItemAllowed ? (
                <Layouts.Margin right="3">
                  <Layouts.Box minWidth="276px">
                    <Typography
                      onClick={() => setFieldValue('droppedEquipmentItemApplied', true)}
                      color="information"
                      variant="bodyMedium"
                      cursor="pointer"
                    >
                      <Layouts.Flex alignItems="center">
                        <Layouts.Margin right="1">
                          <Layouts.Flex>
                            <AssignIcon />
                          </Layouts.Flex>
                        </Layouts.Margin>
                        Assign equipment for service
                      </Layouts.Flex>
                    </Typography>
                  </Layouts.Box>
                </Layouts.Margin>
              ) : null}
            </Layouts.Flex>
          </Subsection>
        ) : null}
        <Subsection gray>
          <ManifestItemsSection onRateRequest={onRateRequest} editable />
          <ThresholdsSection />
          <LineItemsSection onRateRequest={onRateRequest} />
        </Subsection>
      </Section>
    </>
  );
};

export default observer(OrderSection);
