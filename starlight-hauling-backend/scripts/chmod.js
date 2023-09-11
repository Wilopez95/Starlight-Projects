import { chmodSync as fsChmodSync, statSync } from 'fs';
import StatMode from 'stat-mode';

const PLUS = '+';
const MINUS = '-';
const EQUAL = '=';

const makeBoolKey = (bool, target, keys) => {
  keys.forEach(key => {
    target[key] = bool;
  });
};

const OPERATORS = {
  [PLUS]: (target, keys) => {
    makeBoolKey(true, target, keys);
  },

  [MINUS]: (target, keys) => {
    makeBoolKey(false, target, keys);
  },

  [EQUAL]: (target, keys, range) => {
    range.forEach(key => {
      target[key] = keys.includes(key);
    });
  },
};

const REFERENCE_TYPES = ['owner', 'group', 'others'];

const NORMAL_MODE_TYPES = ['read', 'write', 'execute'];

const MODE_PRESETS = {
  r: {
    key: 'read',
  },
  w: {
    key: 'write',
  },
  x: {
    key: 'execute',
  },
  s: {
    mutator(Mode, operator) {
      if (Mode.owner) {
        Mode.setuid = operator !== MINUS;
      }

      if (Mode.group) {
        Mode.setgid = operator !== MINUS;
      }
    },
  },
  t: {
    group: 2,
    mutator(Mode, operator) {
      Mode.sticky = operator !== MINUS;
    },
  },
};

const PERMISSION_TYPES = ['owner', 'group', 'others'];

// https://en.wikipedia.org/wiki/Chmod#Special_modes
const SPECIAL_MODES = ['setuid', 'setgid', 'sticky'];

const createAddRef = type => Mode => {
  Mode[type] = Object.create(null);
};

const u = createAddRef('owner');
const g = createAddRef('group');
const o = createAddRef('others');

const REFERENCE_MUTATORS = {
  u,
  g,
  o,
  a(stat) {
    u(stat);
    g(stat);
    o(stat);
  },
};

const REGEX_OPERATOR = /-|=|\+/g;

const invalidFileMode = symbol => {
  const err = new RangeError(`[fs-chmod] invalid file mode: ${symbol}`);
  err.code = 'INVALID_FILE_MODE';
  return err;
};

const parse = symbolic => {
  const invalid = () => {
    throw invalidFileMode(symbolic);
  };

  const [
    reference,
    mode,
    // We allow symbolic notation with more then one operators:
    // a+x+x
    // The second operator and the following characters will be ignored
  ] = symbolic.split(REGEX_OPERATOR);

  if (!mode) {
    invalid();
  }

  const references = reference ? reference.split('') : ['a'];

  const Mode = Object.create(null);

  references.forEach(ref => {
    const mutator = REFERENCE_MUTATORS[ref];
    if (!mutator) {
      invalid();
    }

    mutator(Mode);
  });

  const operator = symbolic.charAt(reference.length);
  const modes = mode.split('');
  const keys = [];

  modes.forEach(m => {
    const preset = MODE_PRESETS[m];

    if (!preset) {
      invalid();
    }

    const { key, mutator } = preset;

    if (key) {
      keys.push(key);
      return;
    }

    mutator(Mode, operator);
  });

  REFERENCE_TYPES.forEach(type => {
    const permission = Mode[type];
    if (!permission) {
      return;
    }

    OPERATORS[operator](permission, keys, NORMAL_MODE_TYPES);
  });

  return Mode;
};

const normalizeObject = (mode, object) => {
  PERMISSION_TYPES.forEach(key => {
    Object.assign(mode[key], object[key]);
  });

  SPECIAL_MODES.forEach(key => {
    if (object[key]) {
      mode[key] = object[key];
    }
  });

  return mode.stat.mode;
};

const normalize = (stat, rawMode) => {
  const mode = new StatMode(stat);
  if (!Number.isSafeInteger(rawMode)) {
    return normalizeObject(mode, parse(rawMode));
  }

  throw new TypeError(`mode should be of number or string, but got \`${rawMode}\``);
};

const prepareSync = (file, rawMode) => {
  if (Number.isSafeInteger(rawMode)) {
    return rawMode;
  }

  const stat = statSync(file);
  return normalize(stat, rawMode);
};

export const chmodSync = (file, rawMode) => {
  const mode = prepareSync(file, rawMode);
  return fsChmodSync(file, mode);
};
