/* eslint-disable complexity */ // disabled because it will need a huge refactor
import React, { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { Helmet } from 'react-helmet';
import { useTranslation } from 'react-i18next';
import { Route, Switch, useParams, useRouteMatch } from 'react-router';
import { Link, useHistory } from 'react-router-dom';
import {
  Autocomplete,
  Button,
  IAutocompleteConfig,
  Layouts,
} from '@starlightpro/shared-components';
import { endOfToday, isAfter } from 'date-fns';
import { FormikProvider, useFormik } from 'formik';
import { noop } from 'lodash-es';
import { observer } from 'mobx-react-lite';

import { GlobalService } from '@root/api/global/global';
import { ArrowLeftIcon, CrossIcon, PlusIcon } from '@root/assets';
import {
  AutocompleteTemplates,
  Banner,
  Section,
  Subsection,
  Tooltip,
  Typography,
} from '@root/common';
import { OrderTypeSelect } from '@root/components';
import { IJobSiteData } from '@root/components/forms/JobSite/types';
import { ILinkSubscriptionOrderData } from '@root/components/forms/LinkSubscriptionOrder/types';
import { INewCustomerData } from '@root/components/forms/NewCustomer/types';
import {
  JobSiteModal,
  LinkSubscriptionOrderModal,
  NewCustomerModal,
  PopUpNoteModal,
  ProjectModal,
} from '@root/components/modals';
import {
  BusinessLineType,
  ClientRequestType,
  CustomerStatus,
  OrderStatusRoutes,
  Paths,
  SubscriptionTabRoutes,
} from '@root/consts';
import { US_CENTROID } from '@root/consts/address';
import { handleEnterOrSpaceKeyDown, logicalXOR, pathToUrl } from '@root/helpers';
import {
  useBoolean,
  useBusinessContext,
  usePermission,
  useQueryParams,
  useScrollOnError,
  useStores,
  useToggle,
} from '@root/hooks';
import { convertJobSiteCustomerPairDates } from '@root/stores/subscription/helpers';
import { ICustomerJobSitePair, IProject } from '@root/types';
import { CustomerSuggestion } from '@root/types/responseEntities';

import { Project } from '../../../stores/entities';
import { CustomerInfoBlock, JobSiteInfoBlock, ProjectInfoBlock } from './components/infoBlocks';
import { LinkedCustomers, LinkedJobSites, LinkedProjects } from './components/linked';
import { BusinessLineSelector, ServiceAreaSelector } from './components/selectors';
import { useOrderRequestPayload, useRecurrentOrderPayload } from './forms/Order/hooks';
import NewOrderForm from './forms/Order/NewOrderForm';
import NewRecurrentOrderForm from './forms/RecurrentOrder/NewRecurrentOrderForm';
import { useSubscriptionOrderTypeFromParams } from './forms/Subscription/helpers/subscriptionOrderTypeFromParams';
import { useCreateSubscriptionOrder, useEditSubscription } from './forms/Subscription/hooks';
import NewSubscriptionForm from './forms/Subscription/NewSubscriptionForm';
import { useDefaultValue } from './hooks/useDefaultValue';
import { INewClientRequest } from './types';

const requestLimit = 6;
const hasProject = [BusinessLineType.rollOff, BusinessLineType.portableToilets];
const hasProjectRequestType = [
  ClientRequestType.RegularOrder,
  ClientRequestType.RecurrentOrder,
  ClientRequestType.NonServiceOrder,
];

const I18NPath = 'pages.NewRequest.NewRequestForm.Text.';
const today = endOfToday();

const NewRequestForm: React.FC = () => {
  const history = useHistory();
  const { t } = useTranslation();
  const { businessUnitId } = useBusinessContext();
  const { subscriptionId, orderId, orderRequestId } = useParams<{
    subscriptionId: string;
    orderId: string;
    orderRequestId: string;
  }>();

  const { jobSiteStore, customerStore, projectStore, businessLineStore } = useStores();

  const [isCustomerPopupNoteOpen, showCustomerPopupNote, hideCustomerPopupNote] = useBoolean();
  const [isJobSiteModalOpen, openJobSiteModal, closeJobSiteModal] = useBoolean();
  const [isProjectSubsectionShown, showProjectSubsection, hideProjectSubsection] = useBoolean();

  const [isNewCustomerModalOpen, toggleNewCustomerModalOpen] = useToggle();
  const [isProjectModalOpen, toggleProjectModalOpen] = useToggle();
  const [isLinkSubscriptionOrderOpen, toggleLinkSubscriptionOrderModalOpen] = useToggle();

  const [customerData, setCustomerData] = useState<INewCustomerData>();
  const [totalProcessedSum, setTotalProcessedSum] = useState<number>(0);

  const linkedData = useRef<ICustomerJobSitePair>();

  const selectedJobSite = jobSiteStore.selectedEntity;
  const selectedCustomer = customerStore.selectedEntity;
  const selectedProject = projectStore.selectedEntity;

  const jobSiteAndCustomerAreSelected = selectedJobSite && selectedCustomer;

  const onlyJobSiteOrCustomerIsSelected = logicalXOR(selectedJobSite, selectedCustomer);

  const defaultValue = useDefaultValue();
  const subscriptionOrderTypeParam = useSubscriptionOrderTypeFromParams();
  const { subscriptionFormValue, subscriptionCloneFormValue } = useEditSubscription();
  const { subscriptionOrderFormValue } = useCreateSubscriptionOrder(subscriptionOrderTypeParam);
  const orderRequestFormValue = useOrderRequestPayload();
  const recurrentOrderFormValue = useRecurrentOrderPayload();

  const isClone = !!useRouteMatch(Paths.RequestModule.Subscription.Clone);
  const [isConfirmedCustomerForClone, setIsConfirmedCustomerForClone] = useState(!isClone);
  const [isConfirmedJobSiteForClone, setIsConfirmedJobSiteForClone] = useState(!isClone);

  const isEdit =
    !!subscriptionFormValue ||
    !!subscriptionOrderFormValue ||
    !!orderRequestFormValue ||
    !!recurrentOrderFormValue;
  const isReadOnly = isEdit;

  useEffect(() => {
    let cancel = false;
    if (!orderId && !subscriptionId && !orderRequestId) {
      if (cancel) return;
      const route = pathToUrl(Paths.RequestModule.Request, {
        businessUnit: businessUnitId,
      });

      history.replace(route);
    }
    return () => {
      cancel = true;
    };
  }, [businessUnitId, history, orderId, subscriptionId, orderRequestId]);

  useEffect(() => {
    let cancel = false;
    if (selectedCustomer) {
      if (cancel) return;
      selectedCustomer.requestBalances();
    }
    return () => {
      cancel = true;
    };
  }, [selectedCustomer, customerStore]);

  const getInitialValue = (): INewClientRequest => {
    if (subscriptionOrderFormValue) {
      return subscriptionOrderFormValue;
    }

    if (subscriptionFormValue) {
      return subscriptionFormValue;
    }

    if (orderRequestFormValue) {
      return orderRequestFormValue;
    }

    if (recurrentOrderFormValue) {
      return recurrentOrderFormValue;
    }

    if (subscriptionCloneFormValue) {
      return subscriptionCloneFormValue;
    }

    return defaultValue;
  };

  const formik = useFormik<INewClientRequest>({
    initialValues: getInitialValue(),
    initialErrors: {},
    onSubmit: noop,
    onReset: noop,
    enableReinitialize: true,
  });

  const { values, setFieldValue, setFormikState, initialValues, errors, isSubmitting } = formik;

  const res = useQueryParams();

  useEffect(() => {
    let cancel = false;
    const customerId = res.get('customerId');

    if (customerId) {
      if (cancel) return;
      setFieldValue('customerId', customerId);
      customerStore.requestById(+customerId);
    }
    return () => {
      cancel = true;
    };
  }, [res, setFieldValue, customerStore]);

  useEffect(() => {
    let cancel = false;
    const jobSiteId = res.get('jobSiteId');

    if (jobSiteId) {
      if (cancel) return;
      setFieldValue('jobSiteId', jobSiteId);
      jobSiteStore.requestById(+jobSiteId);
    }
    return () => {
      cancel = true;
    };
  }, [res, setFieldValue, jobSiteStore]);

  useEffect(() => {
    let cancel = false;
    (async () => {
      if (selectedCustomer && selectedJobSite) {
        projectStore.cleanup();

        linkedData.current = convertJobSiteCustomerPairDates(
          await GlobalService.getJobSiteCustomerPair(selectedJobSite.id, selectedCustomer.id),
        );

        const purchaseOrder = [
          ...(linkedData.current?.purchaseOrders ?? []),
          ...(selectedCustomer.purchaseOrders ?? []),
        ].find(
          ({ expirationDate, active }) =>
            active && (!expirationDate || (expirationDate && !isAfter(today, expirationDate))),
        );

        if (subscriptionOrderFormValue && !subscriptionOrderFormValue.orders[0].purchaseOrderId) {
          if (cancel) return;
          setFieldValue('orders[0].purchaseOrderId', purchaseOrder?.id);
        }

        if (!subscriptionOrderFormValue) {
          if (cancel) return;
          setFieldValue('purchaseOrderId', purchaseOrder?.id);
        }

        const customerJobSiteId = linkedData.current?.id;

        if (customerJobSiteId) {
          projectStore.request({
            customerJobSiteId: linkedData?.current?.id,
            limit: requestLimit,
            currentOnly: true,
          });
          if (values.projectId) {
            const project = projectStore.getById(values.projectId);

            if (project) {
              projectStore.selectEntity(project);
            } else {
              projectStore.requestById(values.projectId);
            }
          }
        }

        if (selectedCustomer.popupNote || linkedData.current?.popupNote) {
          showCustomerPopupNote();
        }
      }
    })();
    return () => {
      cancel = true;
    };
  }, [
    selectedCustomer,
    selectedJobSite,
    projectStore,
    showCustomerPopupNote,
    values.projectId,
    setFieldValue,
    subscriptionOrderFormValue,
  ]);

  const getBackToRoute = () => {
    switch (values.type) {
      case ClientRequestType.Subscription:
        return pathToUrl(Paths.SubscriptionModule.Subscriptions, {
          businessUnit: businessUnitId,
          tab: SubscriptionTabRoutes.Active,
        });
      case ClientRequestType.OrderRequest:
        return pathToUrl(Paths.OrderModule.OrderRequests, {
          businessUnit: businessUnitId,
        });
      default:
        return pathToUrl(Paths.OrderModule.Orders, {
          businessUnit: businessUnitId,
          subPath: OrderStatusRoutes.InProgress,
        });
    }
  };

  const businessLineType = businessLineStore.getById(values.businessLineId)?.type;

  useScrollOnError(errors, isSubmitting);

  useLayoutEffect(() => {
    let cancel = false;
    if (!isEdit) {
      if (cancel) return;
      setFieldValue('serviceAreaId', undefined);
    }
    if (isClone) {
      if (subscriptionCloneFormValue?.serviceAreaId !== undefined) {
        if (cancel) return;
        setFieldValue('serviceAreaId', subscriptionCloneFormValue?.serviceAreaId);
      }
    }
    return () => {
      cancel = true;
    };
  }, [isClone, isEdit, setFieldValue]);

  useEffect(() => {
    let cancel = false;
    if (!subscriptionOrderTypeParam) {
      return;
    }
    if (cancel) return;
    setFieldValue('type', subscriptionOrderTypeParam);
    return () => {
      cancel = true;
    };
  }, [subscriptionOrderTypeParam, setFieldValue]);

  useEffect(() => {
    let cancel = false;
    if (selectedCustomer && customerData?.createAndLinkJobSite) {
      if (cancel) return;
      setCustomerData(undefined);
      openJobSiteModal();
    }
    return () => {
      cancel = true;
    };
  }, [customerData?.createAndLinkJobSite, openJobSiteModal, selectedCustomer]);

  const handleRequestTypeSelect = useCallback(
    (type: ClientRequestType) => {
      if (
        [ClientRequestType.SubscriptionOrder, ClientRequestType.SubscriptionNonService].includes(
          type,
        )
      ) {
        return toggleLinkSubscriptionOrderModalOpen();
      }

      setFieldValue('type', type);

      const backToRoute = pathToUrl(
        type === ClientRequestType.Subscription
          ? Paths.RequestModule.Subscription.Create
          : Paths.RequestModule.Order.Create,
        {
          businessUnit: businessUnitId,
        },
      );

      history.replace(backToRoute);
    },
    [businessUnitId, history, setFieldValue, toggleLinkSubscriptionOrderModalOpen],
  );

  const handleCustomerSelect = useCallback(
    ({ id }: { id: number }) => {
      customerStore.requestById(id);
    },
    [customerStore],
  );

  const handleJobSiteSelect = useCallback(
    ({ id }: { id: number }) => {
      jobSiteStore.requestById(id);
    },
    [jobSiteStore],
  );

  const confirmCustomerForClone = useCallback(() => {
    setIsConfirmedCustomerForClone(true);
    setFieldValue('searchString', selectedJobSite?.address.addressLine1);
  }, [setFieldValue, selectedJobSite?.address.addressLine1]);

  useEffect(() => {
    let cancel = false;
    if (isClone) {
      if (cancel) return;
      confirmCustomerForClone();
    }
    if (jobSiteStore) {
      if (cancel) return;
      setIsConfirmedJobSiteForClone(true);
    }
    return () => {
      cancel = true;
    };
  }, [
    isClone,
    selectedCustomer,
    customerStore,
    selectedJobSite,
    jobSiteStore,
    confirmCustomerForClone,
    setIsConfirmedJobSiteForClone,
  ]);

  const handleCustomerAutocompleteSelect = useCallback(
    ({ id }: { id: number }) => {
      setFieldValue('searchString', '');
      setFieldValue('customerId', id);
      if (isClone) {
        confirmCustomerForClone();
      }
      customerStore.requestById(id);
    },
    [customerStore, setFieldValue, isClone, confirmCustomerForClone],
  );

  const linkJobSiteAndCustomer = useCallback(
    async jobSiteId => {
      if (!selectedCustomer || !jobSiteId) {
        return;
      }
      const jobSite = await jobSiteStore.requestById(jobSiteId.id as number);
      const { id, poRequired, signatureRequired, invoiceEmails } = selectedCustomer;
      jobSiteStore.linkToCustomer({
        active: true,
        permitRequired: false,
        alleyPlacement: jobSite?.alleyPlacement ?? false,
        cabOver: jobSite?.cabOver ?? false,
        customerId: id,
        jobSiteId: jobSiteId.id,
        popupNote: null,
        poRequired,
        signatureRequired,
        invoiceEmails,
        sendInvoicesToJobSite: false,
        taxDistricts: undefined,
        workOrderNotes: null,
      });
    },
    [selectedCustomer, jobSiteStore],
  );

  const handleJobSiteAutocompleteSelect = useCallback(
    async ({ id }: { id: number }) => {
      setFieldValue('searchString', '');
      if (isClone) {
        setIsConfirmedJobSiteForClone(true);
      }
      const jobSite = await jobSiteStore.requestById(id);
      linkJobSiteAndCustomer(jobSite);
    },
    [jobSiteStore, setFieldValue, isClone, setIsConfirmedJobSiteForClone, linkJobSiteAndCustomer],
  );

  const handleJobSiteFormSubmit = useCallback(
    (jobSite: IJobSiteData) => {
      setFieldValue('searchString', '');
      if (selectedCustomer) {
        jobSiteStore.create({ data: jobSite, linkTo: selectedCustomer?.id }, true);
        setCustomerData(undefined);
      } else {
        jobSiteStore.create({ data: jobSite }, true);
      }
      closeJobSiteModal();
    },
    [setFieldValue, closeJobSiteModal, jobSiteStore, selectedCustomer],
  );

  const handleNewCustomerFormSubmit = useCallback(
    async (data: INewCustomerData) => {
      const customer = await customerStore.create({
        ...data,
        creditLimit: data.creditLimit ?? 0,
        businessUnitId: +businessUnitId,
      });

      if (customer) {
        toggleNewCustomerModalOpen();
      }
      setCustomerData(data);
    },
    [customerStore, businessUnitId, toggleNewCustomerModalOpen],
  );

  const handleJobSiteModalClose = useCallback(() => {
    closeJobSiteModal();
    jobSiteStore.unSelectEntity();
  }, [jobSiteStore, closeJobSiteModal]);

  const handleJobSiteClear = useCallback(() => {
    jobSiteStore.unSelectEntity();

    setFormikState(state => ({
      ...state,
      errors: {},
      values: {
        ...initialValues,
        customerId: state.values.customerId,
      },
    }));

    const route = pathToUrl(Paths.RequestModule.Request, {
      businessUnit: businessUnitId,
    });

    history.replace(route);
  }, [businessUnitId, history, initialValues, jobSiteStore, setFormikState]);

  const handleCustomerClear = useCallback(() => {
    customerStore.unSelectEntity();

    setFormikState(state => ({
      ...state,
      errors: {},
      values: {
        ...initialValues,
        jobSiteId: state.values.jobSiteId,
      },
    }));

    const route = pathToUrl(Paths.RequestModule.Request, {
      businessUnit: businessUnitId,
    });

    history.replace(route);
  }, [businessUnitId, customerStore, history, initialValues, setFormikState]);

  const handleUndo = useCallback(
    (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
      history.goBack();
      e.preventDefault();
    },
    [history],
  );

  const handleProjectFormSubmit = useCallback(
    (data: IProject) => {
      const customerJobSiteId = linkedData?.current?.id;

      if (selectedCustomer && selectedJobSite) {
        if (selectedProject) {
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
      }
      toggleProjectModalOpen();
    },
    [
      projectStore,
      selectedCustomer,
      selectedJobSite,
      selectedProject,
      linkedData,
      toggleProjectModalOpen,
    ],
  );

  const handleProjectSelect = useCallback(
    (project: Project) => {
      projectStore.selectEntity(project, false);
    },
    [projectStore],
  );

  const handleLinkSubscriptionOrderFormSubmit = useCallback(
    (data: ILinkSubscriptionOrderData) => {
      const { requestType, subscriptionId: subscriptionIdData } = data;

      // we do not set type explicitly here, since it will be deferred to useEffect history listen
      const backToRoute = pathToUrl(
        requestType === ClientRequestType.SubscriptionOrder
          ? Paths.RequestModule.SubscriptionOrder.Create
          : Paths.RequestModule.SubscriptionNonService.Create,
        {
          businessUnit: businessUnitId,
          subscriptionId: subscriptionIdData,
        },
      );

      history.replace(backToRoute);

      toggleLinkSubscriptionOrderModalOpen();
    },
    [businessUnitId, history, toggleLinkSubscriptionOrderModalOpen],
  );

  const handleRemove = useCallback(() => {
    projectStore.unSelectEntity();
    projectStore.cleanup();
    projectStore.request({
      customerJobSiteId: linkedData?.current?.id,
      limit: requestLimit,
      currentOnly: true,
    });
    hideProjectSubsection();
  }, [hideProjectSubsection, projectStore]);

  const handleProjectClear = useCallback(() => {
    projectStore.unSelectEntity();
    projectStore.cleanup();
    projectStore.request({
      customerJobSiteId: linkedData?.current?.id,
      limit: requestLimit,
      currentOnly: true,
    });
    setFormikState(state => ({
      ...state,
      errors: {},
      values: {
        ...values,
        customerId: state.values.customerId,
        jobSiteId: state.values.jobSiteId,
      },
    }));
  }, [values, projectStore, setFormikState]);

  const actionTitle = useMemo(() => {
    if (
      isEdit &&
      [ClientRequestType.Subscription, ClientRequestType.RecurrentOrder].includes(values.type)
    ) {
      return t('Text.Edit');
    }

    if (isClone) {
      return t(`${I18NPath}Clone`);
    }

    if (
      [ClientRequestType.SubscriptionOrder, ClientRequestType.SubscriptionNonService].includes(
        values.type,
      )
    ) {
      return t(`${I18NPath}LinkNew`);
    }

    return t(`${I18NPath}PlaceNew`);
  }, [isEdit, values.type, isClone, t]);

  const placeNewTitle = useMemo(() => {
    switch (values.type) {
      case ClientRequestType.Subscription:
        return 'Subscription';
      case ClientRequestType.RegularOrder:
        return 'Regular Order';
      case ClientRequestType.NonServiceOrder:
        return 'Non-service Order';
      case ClientRequestType.SubscriptionOrder:
        return 'Subscription Order';
      case ClientRequestType.SubscriptionNonService:
        return 'Subscription Non-service Order';
      case ClientRequestType.RecurrentOrder:
        return 'Recurrent Order';
      case ClientRequestType.OrderRequest:
        return 'Order Request';
      case ClientRequestType.RentalOrder:
        return 'Rental Order';
      default:
        return 'Service';
    }
  }, [values.type]);

  const canCreateCustomers = usePermission('customers:create:perform');
  const canPlaceOnHoldOrders = usePermission([
    'orders:new-prepaid-on-hold-order:perform',
    'orders:new-on-account-on-hold-order:perform',
  ]);

  const customerAutocompleteConfigs = useMemo<IAutocompleteConfig[]>(
    () => [
      {
        name: 'customers',
        onSelect: handleCustomerAutocompleteSelect,
        template: <AutocompleteTemplates.Customer />,
        footer: canCreateCustomers && <AutocompleteTemplates.Footer text="Create new customer" />,
        onFooterClick: toggleNewCustomerModalOpen,
        isOptionDisabled: (customer: CustomerSuggestion) =>
          customer.status === CustomerStatus.inactive ||
          (customer.status === CustomerStatus.onHold && !canPlaceOnHoldOrders),
      },
    ],
    [
      canCreateCustomers,
      canPlaceOnHoldOrders,
      handleCustomerAutocompleteSelect,
      toggleNewCustomerModalOpen,
    ],
  );

  const jobSiteAutocompleteConfigs = useMemo<IAutocompleteConfig[]>(
    () => [
      {
        name: 'jobSites',
        onSelect: handleJobSiteAutocompleteSelect,
        template: <AutocompleteTemplates.JobSite />,
        footer: <AutocompleteTemplates.Footer text="Create new job site" />,
        onFooterClick: openJobSiteModal,
      },
    ],
    [handleJobSiteAutocompleteSelect, openJobSiteModal],
  );

  const autocompleteConfigs = useMemo<IAutocompleteConfig[]>(
    () => [
      {
        name: 'customers',
        onSelect: handleCustomerAutocompleteSelect,
        template: <AutocompleteTemplates.Customer />,
        footer: canCreateCustomers && <AutocompleteTemplates.Footer text="Create new customer" />,
        onFooterClick: toggleNewCustomerModalOpen,
        isOptionDisabled: (customer: CustomerSuggestion) =>
          customer.status === CustomerStatus.inactive ||
          (customer.status === CustomerStatus.onHold && !canPlaceOnHoldOrders),
      },
      {
        name: 'jobSites',
        onSelect: handleJobSiteAutocompleteSelect,
        template: <AutocompleteTemplates.JobSite />,
        footer: <AutocompleteTemplates.Footer text="Create new job site" />,
        onFooterClick: openJobSiteModal,
      },
    ],
    [
      canCreateCustomers,
      canPlaceOnHoldOrders,
      handleCustomerAutocompleteSelect,
      handleJobSiteAutocompleteSelect,
      openJobSiteModal,
      toggleNewCustomerModalOpen,
    ],
  );

  const handleAutocompleteRequest = useCallback(
    (search: string) => GlobalService.multiSearch(search, businessUnitId),
    [businessUnitId],
  );

  const handleKeyDown = (e: React.KeyboardEvent<HTMLOrSVGElement>, callback: () => void) => {
    if (handleEnterOrSpaceKeyDown(e)) {
      callback();
    }
  };

  const projectPlaceholderSection =
    projectStore.values.length > 0 ? (
      <Typography
        tabIndex={0}
        color={linkedData.current ? 'information' : 'secondary'}
        shade={linkedData.current ? 'standard' : 'desaturated'}
        cursor={linkedData.current ? 'pointer' : 'not-allowed'}
        variant="bodyMedium"
        role="button"
        onClick={linkedData.current ? showProjectSubsection : noop}
        onKeyDown={e => (linkedData.current ? handleKeyDown(e, showProjectSubsection) : noop)}
      >
        <Layouts.Flex alignItems="center">
          <Layouts.IconLayout height="12px" width="12px">
            <PlusIcon />
          </Layouts.IconLayout>
          Add project
        </Layouts.Flex>
      </Typography>
    ) : (
      <Typography
        color={linkedData.current ? 'information' : 'secondary'}
        shade={linkedData.current ? 'standard' : 'desaturated'}
        cursor={linkedData.current ? 'pointer' : 'not-allowed'}
        variant="bodyMedium"
        tabIndex={0}
        role="button"
        onClick={linkedData.current ? toggleProjectModalOpen : noop}
        onKeyDown={e => (linkedData.current ? handleKeyDown(e, toggleProjectModalOpen) : noop)}
      >
        <Layouts.Flex alignItems="center">
          <Layouts.IconLayout height="12px" width="12px">
            <PlusIcon />
          </Layouts.IconLayout>
          Create new project
        </Layouts.Flex>
      </Typography>
    );

  return (
    <>
      <Helmet title={t(isEdit ? 'Titles.EditRequest' : 'Titles.CreateNewRequest')} />
      {businessLineType && hasProject.includes(businessLineType) ? (
        <ProjectModal
          isOpen={isProjectModalOpen}
          onFormSubmit={handleProjectFormSubmit}
          onClose={toggleProjectModalOpen}
          linkedData={linkedData.current}
          locked={{
            poRequired: selectedCustomer?.poRequired,
          }}
        />
      ) : null}
      <PopUpNoteModal
        isOpen={isCustomerPopupNoteOpen}
        onClose={hideCustomerPopupNote}
        customerPopupNote={selectedCustomer?.popupNote}
        jobSitePopupNote={linkedData.current?.popupNote ?? ''}
      />
      <JobSiteModal
        isOpen={isJobSiteModalOpen}
        onFormSubmit={handleJobSiteFormSubmit}
        onClose={handleJobSiteModalClose}
        jobSite={
          customerData
            ? {
                address: customerData.mailingAddress,
                searchString: customerData.searchString,
                location: customerData.location ?? US_CENTROID,
                alleyPlacement: false,
                cabOver: false,
              }
            : undefined
        }
      />
      <NewCustomerModal
        isOpen={isNewCustomerModalOpen}
        onFormSubmit={handleNewCustomerFormSubmit}
        onClose={toggleNewCustomerModalOpen}
      />
      <LinkSubscriptionOrderModal
        isOpen={isLinkSubscriptionOrderOpen}
        title="Link Order / Non-Service Order to Subscription"
        businessLineId={values.businessLineId}
        customerId={selectedCustomer?.id}
        jobSiteId={selectedJobSite?.id}
        serviceAreaId={values.serviceAreaId}
        onFormSubmit={handleLinkSubscriptionOrderFormSubmit}
        onClose={toggleLinkSubscriptionOrderModalOpen}
      />
      <FormikProvider value={formik}>
        <Layouts.Box width="100%" backgroundColor="secondary" backgroundShade="dark">
          <Layouts.Padding padding="3">
            <Layouts.Flex alignItems="center" justifyContent="space-between">
              <Link to={getBackToRoute()} onClick={handleUndo}>
                <Layouts.Flex alignItems="center">
                  <Layouts.IconLayout width="24px" height="24px">
                    <ArrowLeftIcon />
                  </Layouts.IconLayout>
                  <Typography variant="bodyMedium" color="secondary" shade="desaturated">
                    Back
                  </Typography>
                </Layouts.Flex>
              </Link>
              <Typography as="h1" variant="headerThree" color="white">
                {actionTitle} {placeNewTitle}
              </Typography>
            </Layouts.Flex>

            {!selectedCustomer && !selectedJobSite && !isClone ? (
              <Layouts.Margin top="3">
                <Autocomplete
                  name="searchString"
                  placeholder="Search customers and job sites"
                  ariaLabel="Search customers and job sites"
                  search={values.searchString}
                  onSearchChange={setFieldValue}
                  onRequest={handleAutocompleteRequest}
                  size="large"
                  minSearchLength={1}
                  configs={autocompleteConfigs}
                  noErrorMessage
                />
              </Layouts.Margin>
            ) : null}
          </Layouts.Padding>
        </Layouts.Box>

        {(selectedCustomer || selectedJobSite) &&
        (isConfirmedCustomerForClone || isConfirmedJobSiteForClone) ? (
          <Section>
            {selectedCustomer && isConfirmedCustomerForClone ? (
              <Subsection gray>
                <CustomerInfoBlock
                  readOnly={isReadOnly || isClone}
                  ordersTotal={totalProcessedSum}
                  onClear={handleCustomerClear}
                />
              </Subsection>
            ) : null}
            {selectedJobSite && isConfirmedJobSiteForClone ? (
              <Subsection gray>
                <JobSiteInfoBlock readOnly={isReadOnly || isClone} onClear={handleJobSiteClear} />
              </Subsection>
            ) : null}
            {values.type === ClientRequestType.OrderRequest &&
            selectedCustomer?.status === CustomerStatus.inactive ? (
              <Subsection gray>
                <Banner>
                  <Typography variant="bodyMedium">
                    {t(`${I18NPath}InactiveCustomerMessage`)}
                  </Typography>
                </Banner>
              </Subsection>
            ) : null}
            {onlyJobSiteOrCustomerIsSelected ? (
              <>
                {!selectedCustomer ? (
                  <Subsection>
                    <LinkedCustomers
                      jobSiteId={selectedJobSite?.id}
                      onCustomerSelect={handleCustomerSelect}
                    />
                  </Subsection>
                ) : null}
                {!selectedJobSite ? (
                  <Subsection>
                    <LinkedJobSites
                      customerId={selectedCustomer?.id}
                      onJobSiteSelect={handleJobSiteSelect}
                    />
                  </Subsection>
                ) : null}

                <Subsection>
                  {!selectedCustomer ? (
                    <>
                      <Typography variant="headerFive" color="primary">
                        {t(`${I18NPath}CustomerSearch`)}
                      </Typography>
                      <Layouts.Margin top="1" bottom="3">
                        <Typography variant="bodyMedium" color="secondary" shade="desaturated">
                          {t(`${I18NPath}SearchToLinkAnyCustomers`)}
                        </Typography>
                      </Layouts.Margin>
                      <Autocomplete
                        name="searchString"
                        placeholder={t(`${I18NPath}SearchCustomers`)}
                        ariaLabel={t(`${I18NPath}SearchCustomers`)}
                        search={values.searchString}
                        onSearchChange={setFieldValue}
                        onRequest={handleAutocompleteRequest}
                        configs={customerAutocompleteConfigs}
                        noErrorMessage
                      />
                    </>
                  ) : null}
                  {!selectedJobSite ? (
                    <>
                      <Typography variant="headerFive" color="primary">
                        {t(`${I18NPath}JobSiteSearch`)}
                      </Typography>
                      <Layouts.Margin top="1" bottom="3">
                        <Typography variant="bodyMedium" color="secondary" shade="desaturated">
                          {t(`${I18NPath}SearchToLinkAnyJobSites`)}
                        </Typography>
                      </Layouts.Margin>
                      <Autocomplete
                        name="searchString"
                        placeholder={t(`${I18NPath}SearchOtherJobSite`)}
                        ariaLabel={t(`${I18NPath}SearchOtherJobSite`)}
                        search={values.searchString}
                        onSearchChange={setFieldValue}
                        onRequest={handleAutocompleteRequest}
                        configs={jobSiteAutocompleteConfigs}
                        noErrorMessage
                      />
                    </>
                  ) : null}
                </Subsection>
              </>
            ) : null}
            {jobSiteAndCustomerAreSelected && hasProjectRequestType.includes(values.type) ? (
              <>
                {businessLineType &&
                hasProject.includes(businessLineType) &&
                !selectedProject &&
                !projectStore.loading ? (
                  <>
                    {isProjectSubsectionShown ? (
                      <>
                        <Layouts.Box position="relative">
                          <Subsection>
                            <Layouts.Box
                              position="absolute"
                              right="20px"
                              top="20px"
                              onClick={hideProjectSubsection}
                            >
                              <Typography cursor="pointer">
                                <CrossIcon
                                  tabIndex={0}
                                  role="button"
                                  aria-label={t('Text.Close')}
                                  onKeyDown={e => handleKeyDown(e, hideProjectSubsection)}
                                />
                              </Typography>
                            </Layouts.Box>
                            <LinkedProjects onProjectSelect={handleProjectSelect} />
                          </Subsection>
                        </Layouts.Box>
                        <Subsection gray>
                          <Typography
                            color="information"
                            cursor="pointer"
                            variant="bodyMedium"
                            tabIndex={0}
                            role="button"
                            onClick={toggleProjectModalOpen}
                            onKeyDown={e => handleKeyDown(e, toggleProjectModalOpen)}
                          >
                            <Layouts.Flex alignItems="center">
                              <Layouts.IconLayout height="12px" width="12px">
                                <PlusIcon />
                              </Layouts.IconLayout>
                              Create new project
                            </Layouts.Flex>
                          </Typography>
                        </Subsection>
                      </>
                    ) : null}
                    {!isProjectSubsectionShown ? (
                      <Subsection gray>
                        <Tooltip
                          position="bottom"
                          text={linkedData.current ? '' : t(`${I18NPath}ForNewPairTooltip`)}
                        >
                          {projectPlaceholderSection}
                        </Tooltip>
                      </Subsection>
                    ) : null}
                  </>
                ) : null}

                {businessLineType && hasProject.includes(businessLineType) && selectedProject ? (
                  <Subsection gray>
                    <ProjectInfoBlock
                      onClear={handleProjectClear}
                      onRemove={handleRemove}
                      onConfigure={toggleProjectModalOpen}
                    />
                  </Subsection>
                ) : null}
              </>
            ) : null}
          </Section>
        ) : null}

        {!isConfirmedCustomerForClone ? (
          <>
            <Section>
              <Subsection gray>
                <Typography color="secondary" variant="headerThree">
                  {t(`${I18NPath}PickCustomer`)}
                </Typography>
                <Layouts.Margin top="2">
                  <Autocomplete
                    name="searchString"
                    placeholder={t(`${I18NPath}SearchCustomers`)}
                    ariaLabel={t(`${I18NPath}SearchCustomers`)}
                    search={values.searchString}
                    onSearchChange={setFieldValue}
                    onRequest={handleAutocompleteRequest}
                    size="large"
                    minSearchLength={1}
                    configs={customerAutocompleteConfigs}
                    noErrorMessage
                  />
                </Layouts.Margin>
              </Subsection>
            </Section>
            <Layouts.Flex
              as={Layouts.Margin}
              top="2"
              right="2.5"
              bottom="2"
              justifyContent="flex-end"
            >
              <Button variant="primary" onClick={confirmCustomerForClone}>
                {t(`${I18NPath}Continue`)}
              </Button>
            </Layouts.Flex>
          </>
        ) : null}

        {isConfirmedCustomerForClone && !isConfirmedJobSiteForClone ? (
          <>
            <Section>
              <Subsection gray>
                <Typography color="secondary" variant="headerThree">
                  {t(`${I18NPath}PickJobSite`)}
                </Typography>
                <Layouts.Margin top="2">
                  <Autocomplete
                    name="searchString"
                    placeholder={t(`${I18NPath}SearchJobSite`)}
                    ariaLabel={t(`${I18NPath}SearchJobSite`)}
                    search={values.searchString}
                    onSearchChange={setFieldValue}
                    onRequest={handleAutocompleteRequest}
                    size="large"
                    minSearchLength={1}
                    configs={jobSiteAutocompleteConfigs}
                    noErrorMessage
                  />
                </Layouts.Margin>
              </Subsection>
            </Section>
            <Layouts.Flex
              as={Layouts.Margin}
              top="2"
              right="2.5"
              bottom="2"
              justifyContent="flex-end"
            >
              <Button variant="primary" onClick={() => setIsConfirmedJobSiteForClone(true)}>
                {t(`${I18NPath}Continue`)}
              </Button>
            </Layouts.Flex>
          </>
        ) : null}

        {values.type === ClientRequestType.Unknown && jobSiteAndCustomerAreSelected && !isClone ? (
          <Section>
            <Subsection gray>
              <BusinessLineSelector />
            </Subsection>
            {values.businessLineId ? (
              <>
                <Subsection gray>
                  <ServiceAreaSelector readOnly={isReadOnly} />
                </Subsection>
                {businessLineType ? (
                  <Subsection>
                    <OrderTypeSelect
                      businessLineType={businessLineType}
                      onOrderTypeSelect={handleRequestTypeSelect}
                    />
                  </Subsection>
                ) : null}
              </>
            ) : null}
          </Section>
        ) : null}

        {jobSiteAndCustomerAreSelected &&
        isConfirmedCustomerForClone &&
        isConfirmedJobSiteForClone &&
        !!values.businessLineId &&
        values.type !== ClientRequestType.Unknown ? (
          <Switch>
            <Route path={Paths.RequestModule.Order.Create} exact>
              {values.type === ClientRequestType.RecurrentOrder ? (
                <NewRecurrentOrderForm
                  onOrdersChange={setTotalProcessedSum}
                  commonValues={formik.values}
                />
              ) : (
                <NewOrderForm onOrdersChange={setTotalProcessedSum} commonValues={formik.values} />
              )}
            </Route>
            <Route path={Paths.RequestModule.Order.Edit} exact>
              <NewRecurrentOrderForm
                onOrdersChange={setTotalProcessedSum}
                commonValues={formik.values}
              />
            </Route>
            <Route path={Paths.RequestModule.Subscription.Create} exact>
              <NewSubscriptionForm
                onOrdersChange={setTotalProcessedSum}
                commonValues={formik.values}
              />
            </Route>
            <Route path={Paths.RequestModule.OrderRequest.Edit} exact>
              <NewOrderForm onOrdersChange={setTotalProcessedSum} commonValues={formik.values} />
            </Route>
            <Route
              path={[Paths.RequestModule.Subscription.Edit, Paths.RequestModule.Subscription.Clone]}
              exact
            >
              {/* TODO: add some loader or Skeleton */}
              {subscriptionFormValue || subscriptionCloneFormValue ? (
                <NewSubscriptionForm
                  onOrdersChange={setTotalProcessedSum}
                  commonValues={formik.values}
                  subscriptionValues={subscriptionFormValue ?? subscriptionCloneFormValue}
                  isClone={isClone}
                />
              ) : null}
            </Route>
            <Route path={Paths.RequestModule.SubscriptionOrder.Create} exact>
              <NewOrderForm onOrdersChange={setTotalProcessedSum} commonValues={formik.values} />
            </Route>
            <Route path={Paths.RequestModule.SubscriptionNonService.Create} exact>
              <NewOrderForm onOrdersChange={setTotalProcessedSum} commonValues={formik.values} />
            </Route>
          </Switch>
        ) : null}
      </FormikProvider>
    </>
  );
};

export default observer(NewRequestForm);
