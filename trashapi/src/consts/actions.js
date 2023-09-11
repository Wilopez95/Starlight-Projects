const ACTIONS = {
  dispatcher: {
    access: 'dispatcher:app:full-access',
  },
  configuration: {
    access: 'configuration:dispatcher:full-access',
  },
  driver: {
    access: 'configuration:driver-app-access:full-access',
    woControl: 'configuration:driver-app-wo-control:full-access',
    capPickup: 'configuration:driver-app-can-pickup:full-access',
  },
};

export default ACTIONS;
