export const DefaultResourcePermissionsFragment = `
  type
  permissions {
    name
    mode
    availableModes
  }
`;

export const PolicyFragment = `
  resource
  entries {
    subject
    level
    overridden
  }
`;

export const UserDetailsFragment = `
  id
  status
  name
  email
  firstName
  lastName
  title
  hasPersonalPermissions

  phones {
    type
    number
    extension
  }

  address {
    addressLine1
    addressLine2
    city
    state
    zip
  }

  roles {
    id
    description
    status

    policies {
      ${PolicyFragment}
    }
  }

  salesRepresentatives {
    businessUnitId
    commissionAmount
  }

  allPermissions {
    ${PolicyFragment}
  }
`;

export const UserDetailsInGridFragment = `
  id
  status
  name
  email
  firstName
  lastName
  title
  hasPersonalPermissions

  phones {
    type
    number
    extension
  }

  address {
    addressLine1
    addressLine2
    city
    state
    zip
  }

  roles {
    id
    description
    status
  }

  salesRepresentatives {
    businessUnitId
    commissionAmount
  }
`;

export const RoleDisplayFragment = `
  id
  description
  status
`;

export const RoleDetailsFragment = `
  id
  description
  usersCount
  status

  policies {
    ${PolicyFragment}
  }

  policyTemplates {
    resourceType
    entries {
      subject
      level
    }
  }
`;
