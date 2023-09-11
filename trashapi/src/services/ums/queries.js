export const ME_QUERY = `
  query {
    me {
      id
      firstName
      lastName
      email
      resource
      permissions
      tenantId
      tenantName
    }
  }
`;

export const RESOURCE_INFO = `
  query getResource($srn: String!) {
    resource(srn: $srn) {
      srn
      type
      loginUrl
    }
  }
`;

export const AVAILABLE_RESOURCES = `
  query {
    availableResourceLogins {
      id
      label
      subLabel
      image
      loginUrl
      resourceType
      updatedAt
      tenantName
    }
  }
`;
