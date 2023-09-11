const locationFields = {
  DELIVERY: {
    location1: {
      required: true,
      disabled: false,
    },
    location2: {
      required: false,
      disabled: true,
    },
  },
  SPOT: {
    location1: {
      required: true,
      disabled: false,
    },
    location2: {
      required: false,
      disabled: true,
    },
  },
  FINAL: {
    location1: {
      required: true,
      disabled: false,
    },
    location2: {
      required: false,
      disabled: false,
    },
  },
  'FINAL RESUME': {
    location1: {
      required: true,
      disabled: false,
    },
    location2: {
      required: false,
      disabled: false,
    },
  },
  'FINAL SUSPEND': {
    location1: {
      required: true,
      disabled: false,
    },
    location2: {
      required: false,
      disabled: false,
    },
  },
  SWITCH: {
    location1: {
      required: true,
      disabled: false,
    },
    location2: {
      required: false,
      disabled: false,
    },
  },
  'SWITCH RESUME': {
    location1: {
      required: true,
      disabled: false,
    },
    location2: {
      required: false,
      disabled: false,
    },
  },
  'SWITCH SUSPEND': {
    location1: {
      required: true,
      disabled: false,
    },
    location2: {
      required: false,
      disabled: false,
    },
  },
  'DUMP & RETURN': {
    location1: {
      required: true,
      disabled: false,
    },
    location2: {
      required: false,
      disabled: false,
    },
  },
  'DUMP & RETURN RESUME': {
    location1: {
      required: true,
      disabled: false,
    },
    location2: {
      required: false,
      disabled: false,
    },
  },
  'DUMP & RETURN SUSPEND': {
    location1: {
      required: true,
      disabled: false,
    },
    location2: {
      required: false,
      disabled: false,
    },
  },
  'LIVE LOAD': {
    location1: {
      required: true,
      disabled: false,
    },
    location2: {
      required: false,
      disabled: false,
    },
  },
  'LIVE LOAD RESUME': {
    location1: {
      required: true,
      disabled: false,
    },
    location2: {
      required: false,
      disabled: false,
    },
  },
  'LIVE LOAD SUSPEND': {
    location1: {
      required: true,
      disabled: false,
    },
    location2: {
      required: false,
      disabled: false,
    },
  },
  'PICKUP CAN': {
    location1: {
      required: true,
      disabled: false,
    },
    location2: {
      required: false,
      disabled: true,
    },
  },
  'DROPOFF CAN': {
    location1: {
      required: true,
      disabled: false,
    },
    location2: {
      required: false,
      disabled: true,
    },
  },
  RELOCATE: {
    location1: {
      required: true,
      disabled: false,
    },
    location2: {
      required: true,
      disabled: false,
    },
  },
  REPOSITION: {
    location1: {
      required: true,
      disabled: false,
    },
    location2: {
      required: true,
      disabled: false,
    },
  },
  'GENERAL PURPOSE': {
    location1: {
      required: true,
      disabled: false,
    },
    location2: {
      required: false,
      disabled: true,
    },
  },
};

export default locationFields;
