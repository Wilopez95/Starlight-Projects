import gql from 'graphql-tag';

export const typeDefs = gql`
  enum SORT_ORDER_ENUM {
    asc
    desc
  }

  enum WORK_ORDER_SORTING_COLUMN {
    status
    assignedRoute
    completedAt
    thirdPartyHaulerDescription
    displayId
    instructionsForDriver
    commentId
    fullAddress
    mediaId
  }

  enum MASTER_ROUTE_STATUS_ENUM {
    ACTIVE
    EDITING
    UPDATING
  }

  enum DAILY_ROUTE_STATUS {
    SCHEDULED
    IN_PROGRESS
    COMPLETED
    CANCELED
  }

  enum WORK_ORDER_STATUS_ENUM {
    SCHEDULED
    IN_PROGRESS
    BLOCKED
    CANCELED
    COMPLETED
    APPROVED
    FINALIZED
    INVOICED
  }

  enum HISTORICAL_EVENT_TYPE {
    init
    create
    delete
    generic
  }

  enum WEIGHT_UNIT_ENUM {
    yards
    tons
    gallons
  }

  enum COMMENTS_EVENT_TYPE {
    COMMENT
    ARRIVED_ON_SITE
  }

  enum ROUTE_VIOLATION {
    INACTIVE_TRUCK
    INACTIVE_DRIVER
  }

  enum TRUCK_DRIVER_UNIQUENESS_VIOLATION {
    REPEATED_TRUCK
    REPEATED_DRIVER
  }

  enum BUSINESS_LINE_ROUTE_TYPE {
    C
    R
    CR
    PT
  }

  enum CANCELLATION_REASON {
    userError
    customerCanceled
    other
  }

  enum ORDER_STATUS {
    SCHEDULED
    IN_PROGRESS
    BLOCKED
    SKIPPED
    COMPLETED
    APPROVED
    FINALIZED
    CANCELED
    INVOICED
    NEEDS_APPROVAL
  }

  enum UNIT_OF_MEASURE {
    mi
    km
  }

  enum RESPONSE_STATUS {
    SUCCESS
    FAIL
  }
`;

// TODO: improve sorting params
export const resolvers = {};
