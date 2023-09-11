import { schema } from 'normalizr';

export const user = new schema.Entity('users', {});
export const users = [user];

export const size = new schema.Entity('sizes', {});
export const sizes = [size];

export const document = new schema.Entity('documents', {});
export const documents = [document];

export const template = new schema.Entity('templates', {});
export const templates = [template];

export const material = new schema.Entity('materials', {});
export const materials = [material];

export const truck = new schema.Entity('trucks', {});
export const trucks = [truck];

export const waypoint = new schema.Entity('waypoints', {});
export const waypoints = [waypoint];

export const location = new schema.Entity('locations', {});
export const locations = [location];

export const locationSchema = new schema.Union(
  {
    trucks: truck,
    waypoints: waypoint,
    locations: location,
  },
  // eslint-disable-next-line
  (value, parent, key) => {
    return value && value.type ? `${value.type.toLowerCase()}s` : null;
  },
);

export const driver = new schema.Entity('drivers', {
  truck,
});
export const drivers = [driver];

export const can = new schema.Entity('cans', {
  location: locationSchema,
  prevLocation: locationSchema,
});
export const cans = [can];

export const workOrder = new schema.Entity(
  'workOrders',
  {
    driver,
    location1: locationSchema,
    location2: locationSchema,
  },
  {
    idAttribute: 'id',
    // Apply everything from entityB over entityA, except for "favorites"
    // mergeStrategy: (entityA, entityB, entityC) => ({
    //   driver: entityA.id === null ? {createdBy: null,
    //     createdDate: null,
    //     deleted: null,
    //     id: null,
    //     modifiedBy: null,
    //     modifiedDate: null,
    //     name: null,
    //     photo: null,
    //     truck: null,
    //     username: null} : {...entityA},
    //   ...entityB,
    //   ...entityC
    // }),
    // Remove the URL field from the entity
    // processStrategy: entity => omit(entity, 'url'),
  },
);

export const workOrders = [workOrder];
