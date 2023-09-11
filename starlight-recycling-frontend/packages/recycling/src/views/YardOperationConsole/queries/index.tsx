import { gql } from '@apollo/client';

gql`
  query getHaulingCompanyGeneralSettings {
    haulingCompanyGeneralSettings {
      id
      timeZoneName
      unit
    }
  }
`;

gql`
  fragment OrderFormHaulingCustomerFields on HaulingCustomer {
    id
    businessName
    onAccount
    poRequired
    workOrderRequired
    gradingRequired
    jobSiteRequired
    onHold
    commercial
    gradingNotification
    type
    canTareWeightRequired
  }
`;

export const GET_ORDERS = gql`
  query GetOrders($filter: OrderFilterInput, $sort: [SortInput!]!, $pagination: PaginationInput) {
    orders(filter: $filter, sort: $sort, pagination: $pagination) {
      data {
        id
        type
        customer {
          id
          businessName
        }
        customerTruck {
          id
          truckNumber
          type
        }
        material {
          id
        }
        WONumber
        weightIn
      }
      total
    }
  }
`;

export const GET_CUSTOMER_BUSINESS_NAME = gql`
  query GetCustomerBusinessName($id: Int!) {
    haulingCustomer(id: $id) {
      businessName
    }
  }
`;
export const UPDATE_ORDER = gql`
  mutation UpdateOrder($data: OrderUpdateInput!) {
    updateOrder(data: $data) {
      id
    }
  }
`;

export const DELETE_ORDER = gql`
  mutation DeleteOrder($id: Int!) {
    deleteOrder(id: $id) {
      result
    }
  }
`;

export const GET_ORDER = gql`
  fragment OrderBillableItemFragment on OrderBillableItem {
    uuid
    billableItemId
    billableItem {
      id
      description
      unit
      materialBasedPricing
      materialIds
      type
    }
    materialId
    material {
      id
      description
      units
    }
    readonly
    priceSource
    priceSourceType
    price
    type
    quantity
    globalRatesLineItemsId
    customRatesGroupLineItemsId
    thresholdId
    auto
    globalRatesServiceId
    customRatesGroupServicesId
    globalRatesThresholdsId
    customRatesGroupThresholdsId
    quantityConverted
  }
  query GetOrder($id: Int!) {
    order(id: $id) {
      id
      haulingOrderId
      type
      status
      isSelfService
      destination {
        id
        description
      }
      customer {
        ...OrderFormHaulingCustomerFields
      }
      customerTruck {
        id
        truckNumber
        type
        description
        emptyWeight
      }
      material {
        id
        description
        units
      }
      containerId
      originDistrict {
        state
        county
        city
      }
      container {
        id
        description
        size
        emptyWeight
      }
      jobSiteId
      customerJobSite {
        id
        poRequired
      }
      jobSite {
        id
        fullAddress
        location
      }
      project {
        id
        description
        poRequired
      }
      departureAt
      arrivedAt
      WONumber
      PONumber
      weightIn
      weightOut
      hasWeightTicket
      images {
        filename
        url
      }
      originDistrictId
      materialsDistribution {
        uuid
        materialId
        material {
          id
          description
          code
        }
        value
      }
      miscellaneousMaterialsDistribution {
        uuid
        materialId
        material {
          id
          description
          code
        }
        quantity
      }
      priceGroupId
      paymentMethod
      creditCardId
      billableItems {
        ...OrderBillableItemFragment
      }
      note
      createdAt
      updatedAt
      beforeTaxesTotal
      taxTotal
      grandTotal
      bypassScale
      amount
      isAch
      checkNumber
      weightTicketUrl
      weightOutSource
      weightOutTimestamp
      weightOutType
      weightOutUnit
      weightInType
      weightInSource
      weightScaleUom
      weightInUnit
      weightInTimestamp
      originalWeightIn
      originalWeightOut
      billableService {
        id
        description
      }
      useTare
      truckTare
      canTare
      taxDistricts {
        ...TaxDistrictForOrder
      }
      initialOrderTotal
      minimalWeight
      nonCommercialTruck {
        id
        licensePlate
      }
    }
  }
  query orderBillableItems($id: Int!) {
    order(id: $id) {
      billableItems {
        ...OrderBillableItemFragment
      }
    }
  }
  query minimalWeight($priceGroupId: Int!, $materialId: Int!, $type: OrderType!) {
    minimalWeight(priceGroupId: $priceGroupId, materialId: $materialId, type: $type)
  }
`;

export const GET_ORDERS_BY_WO_NUMBER_AND_CUSTOMER = gql`
  query getOrdersByWONumberAndCustomer(
    $WONumber: String!
    $customerId: Int
    $onlyAllowSelfService: Boolean
  ) {
    ordersByWONumberAndCustomer(
      WONumber: $WONumber
      customerId: $customerId
      onlyAllowSelfService: $onlyAllowSelfService
    ) {
      id
      type
      status
      customerId
      jobSiteId
      jobSite {
        id
        fullAddress
        location
      }
      customer {
        ...OrderFormHaulingCustomerFields
      }
      customerTruck {
        id
      }
      material {
        id
      }
      container {
        id
      }
      customerJobSite {
        id
      }
      project {
        id
      }
      WONumber
      PONumber
      originDistrictId
      note
    }
  }
`;

export const GET_ORDERS_WITH_SAME_WO = gql`
  query getOrdersWithSameWO($WONumber: String!, $customerId: Int) {
    ordersByWONumberAndCustomer(WONumber: $WONumber, customerId: $customerId) {
      id
      status
      customer {
        id
      }
      WONumber
    }
  }
`;

export const GET_ON_THE_WAY_WO_NUMBERS = gql`
  query getOnTheWayWONumbers($customerId: Int, $onlyAllowSelfService: Boolean) {
    onTheWayWONumbers(customerId: $customerId, onlyAllowSelfService: $onlyAllowSelfService) {
      WONumber
      customerBusinessName
    }
  }
`;

gql`
  query GetActiveOriginDistricts {
    activeOriginDistricts {
      id
      state
      county
      city
    }
  }
`;

export const CREATE_ORDER = gql`
  mutation createOrder($data: OrderInput!) {
    createOrder(data: $data) {
      id
    }
  }
`;

export const GET_WALK_UP_CUSTOMER = gql`
  query getWalkUpCustomer {
    getWalkUpCustomer {
      id
      active
      onHold
      businessName
      poRequired
      workOrderRequired
      gradingRequired
      jobSiteRequired
      gradingNotification
      type
    }
  }
`;

export const GET_REQUIRE_ORIGIN = gql`
  query getRequireOrigin {
    company {
      requireOriginOfInboundLoads
    }
  }
`;

export const GET_REQUIRE_DESTINATION = gql`
  query getRequireDestination {
    company {
      requireDestinationOnWeightOut
    }
  }
`;

export const GET_CUSTOMER_JOB_SITE = gql`
  query getHaulingCustomerJobSitesAll($filter: HaulingCustomerJobSiteFilterInput!) {
    haulingCustomerJobSitesAll(filter: $filter) {
      id
      active
      poRequired
      popupNote
      fullAddress
      location
    }
  }

  query getHaulingCustomerJobSites($filter: HaulingCustomerJobSiteFilterInput!) {
    haulingCustomerJobSites(filter: $filter) {
      id
      active
      poRequired
      popupNote
      fullAddress
      location
    }
  }
`;

export const CREATE_ORDER_BILLABLE_ITEMS = gql`
  mutation createOrderBillableItems(
    $priceGroupId: Int!
    $billableItemsIds: [Int!]!
    $materialId: Int
    $type: OrderType!
  ) {
    createOrderBillableItems(
      priceGroupId: $priceGroupId
      billableItemsIds: $billableItemsIds
      materialId: $materialId
      type: $type
    ) {
      ...OrderBillableItemFragment
    }
  }
  mutation fillOrderBillableItemsWithPrices(
    $orderBillableItemsInput: [OrderBillableItemInput!]!
    $priceGroupId: Int!
    $materialId: Int
    $type: OrderType!
  ) {
    fillOrderBillableItemsWithPrices(
      orderBillableItems: $orderBillableItemsInput
      priceGroupId: $priceGroupId
      materialId: $materialId
      type: $type
    ) {
      ...OrderBillableItemFragment
    }
  }
  mutation createAutoOrderBillableItems(
    $priceGroupId: Int!
    $billableItemsIds: [Int!]!
    $materialId: Int
    $type: OrderType!
    $distributionMaterials: [Int!]!
  ) {
    createAutoOrderBillableItems(
      priceGroupId: $priceGroupId
      billableItemsIds: $billableItemsIds
      materialId: $materialId
      type: $type
      distributionMaterials: $distributionMaterials
    ) {
      ...OrderBillableItemFragment
    }
  }
`;

gql`
  mutation makeOrderInYard($id: Int!) {
    makeOrderInYard(id: $id)
  }
`;
gql`
  mutation makeOrderWeightOut($id: Int!) {
    makeOrderWeightOut(id: $id)
  }
`;
gql`
  mutation makeOrderLoaded($id: Int!) {
    makeOrderLoaded(id: $id)
  }
`;
gql`
  mutation makeOrderPayment($id: Int!) {
    makeOrderPayment(id: $id)
  }
`;
gql`
  mutation makeOrderCompleted($id: Int!, $data: OrderCompletedRequestInput) {
    makeOrderCompleted(id: $id, data: $data)
  }
`;
gql`
  mutation makeOrderApproved($id: Int!, $data: OrderApprovedRequestInput) {
    makeOrderApproved(id: $id, data: $data)
  }
`;
gql`
  mutation makeOrderFinalized($id: Int!) {
    makeOrderFinalized(id: $id)
  }
`;
gql`
  mutation makeOrderInvoiced($id: Int!) {
    makeOrderInvoiced(id: $id)
  }
`;
gql`
  mutation completeWalkUpCustomerOrder($id: Int!) {
    completeWalkUpCustomerOrder(id: $id)
  }
`;
