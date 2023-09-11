const isObject = obj => obj !== null && typeof obj === 'object';

// Super fast memoize for single argument functions.
const memoize = func => {
  const cache = new Map();

  return input => {
    let output = cache.get(input);

    if (output === undefined) {
      output = func(input);
      cache.set(input, output);
    }

    return output;
  };
};

const isDigit = char => {
  return char >= '0' && char <= '9';
};

// camelCase to snake_case converter that also works with non-ascii characters
// This is needed especially so that aliases containing the `:` character,
// objection uses internally, work.
const snakeCase = str => {
  if (str.length === 0) {
    return str;
  }

  const upper = str.toUpperCase();
  const lower = str.toLowerCase();

  let result = lower[0];

  for (let i = 1, l = str.length; i < l; ++i) {
    const char = str[i];
    const prevChar = str[i - 1];

    const upperChar = upper[i];
    const prevUpperChar = upper[i - 1];

    const lowerChar = lower[i];
    const prevLowerChar = lower[i - 1];

    if (isDigit(char) && !isDigit(prevChar) && prevChar !== '_') {
      result += `_${char}`;
      continue;
    }

    // Test if `char` is an upper-case character and that the character
    // actually has different upper and lower case versions.
    if (char === upperChar && upperChar !== lowerChar) {
      const prevCharacterIsUppercase =
        prevChar === prevUpperChar && prevUpperChar !== prevLowerChar;

      if (prevCharacterIsUppercase) {
        result += lowerChar;
      } else {
        result += `_${lowerChar}`;
      }
    } else {
      result += char;
    }
  }

  return result;
};

const camelCase = str => {
  if (str.length === 0) {
    return str;
  }

  let result = str[0];

  for (let i = 1, l = str.length; i < l; ++i) {
    const char = str[i];
    const prevChar = str[i - 1];

    if (char !== '_') {
      if (prevChar === '_') {
        result += char.toUpperCase();
      } else {
        result += char;
      }
    }
  }

  return result;
};

const mapLastPart = (mapper, separator) => str => {
  const idx = str.lastIndexOf(separator);
  const mapped = mapper(str.slice(idx + separator.length));

  return str.slice(0, idx + separator.length) + mapped;
};

const keyMapper = mapper => obj => {
  if (!isObject(obj) || Array.isArray(obj)) {
    return obj;
  }

  const result = {};
  Object.keys(obj).forEach(key => {
    result[mapper(key)] = obj[key];
  });

  return result;
};

// `idSeparator` is necessary because objection uses it in relation queries.
export const knexIdentifierMappers = ({ parse, format, idSeparator = ':' } = {}) => {
  const formatId = memoize(mapLastPart(format, idSeparator));
  const parseId = memoize(mapLastPart(parse, idSeparator));
  const parseKeys = keyMapper(parseId);

  return {
    wrapIdentifier(identifier, origWrap) {
      return origWrap(formatId(identifier));
    },
    postProcessResponse(result) {
      if (Array.isArray(result)) {
        const output = new Array(result.length);

        for (let i = 0, l = result.length; i < l; ++i) {
          output[i] = parseKeys(result[i]);
        }

        return output;
      } else {
        return parseKeys(result);
      }
    },
  };
};

export const knexSnakeCaseMappers = () =>
  knexIdentifierMappers({ parse: camelCase, format: snakeCase });
