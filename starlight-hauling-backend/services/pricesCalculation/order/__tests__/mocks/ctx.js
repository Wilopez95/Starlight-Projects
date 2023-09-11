import noop from 'lodash/noop.js';

const ctx = {
  logger: {
    debug: noop,
  },
  state: {
    user: {
      schemaName: 'stark',
      tenantName: 'stark',
    },
  },
};

export default ctx;
