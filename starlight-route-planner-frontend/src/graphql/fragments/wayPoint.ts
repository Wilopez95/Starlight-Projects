export const WayPointFragment = `
    id
    active
    description
    location {
        type
        coordinates
    }
    createdAt
    updatedAt
    address {
        addressLine1
        city
        addressLine2
        state
        zip
    }
    type
`;
