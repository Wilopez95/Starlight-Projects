export const stringError = 'Value should be a string';
export const numberError = 'Value should be a number';
export const nullError = 'Required field';
export const emptyError = 'Value should be an empty';
export const bodyError = 'Validation errors';
export const objectError = 'Value should not be an empty object';
export const inArrayErrorMessage = 'Unknown value, please use known values';
export const unknownErrorMessage = 'Undefined error message';
export const rulesArgumentTypeErrorMessage = 'Argument rules should be an Array type';
export const validationDataTypeErrorMessage = 'Data should be an Object type';

export const buildValidatorTypeErrorMessage = index =>
  `Validator is not an object. Index: ${index}`;
export const buildValidatorParamErrorMessage = index =>
  `Validator's property "param" should be a string type! Index: ${index}`;
export const buildValidatorRulesErrorMessage = (param, index) =>
  `Property "rules" of validator "${param}" should be Array type! Index: ${index}`;
export const buildValidatorFuncErrorMessage = name => `Validator ${name} not found`;

export const errorsMessagesObject = {
  isString: {
    optional: true,
    errorMessage: stringError,
  },
  isNumber: {
    optional: true,
    errorMessage: numberError,
  },
  notEmpty: {
    errorMessage: nullError,
  },
  empty: {
    errorMessage: emptyError,
  },
  isObject: {
    errorMessage: objectError,
  },
};

export const empty = { empty: errorsMessagesObject.empty };

export const rules = {
  // eslint-disable-next-line default-param-last
  inArray: (msg = inArrayErrorMessage, array) => {
    let message = msg;
    let msgArray = array;

    if (typeof msg !== 'string') {
      msgArray = message;
      message = inArrayErrorMessage;
    }
    return {
      name: 'inArray',
      options: msgArray,
      errorMessage: `${message}: "${
        Array.isArray(msgArray) && msgArray.length > 0 ? msgArray.join(', ') : '[no options]'
      }"`,
    };
  },
  isString: (msg = stringError) => ({
    name: 'isString',
    errorMessage: msg,
  }),
  isNumber: (msg = numberError) => ({
    name: 'isNumber',
    errorMessage: msg,
  }),
  notEmpty: (msg = nullError) => ({
    name: 'notEmpty',
    errorMessage: msg,
  }),
  empty: (msg = emptyError) => ({
    name: 'empty',
    errorMessage: msg,
  }),
  isObject: (msg = objectError) => ({
    name: 'isObject',
    errorMessage: msg,
  }),
};

/**
 * It takes a validator name, validator options, and a transformer function, and returns the error
 * message for the validator
 * @param validatorName - The name of the validator.
 * @param validatorOptions - The options passed to the validator.
 * @param [transformer] - This is the object that contains the validation rules.
 * @returns A function that takes in a validatorName, validatorOptions, and transformer.
 */
export const getErrorMessage = (validatorName, validatorOptions, transformer = rules) => {
  const f = transformer[validatorName];
  if (f instanceof Function) {
    const rule = f(validatorOptions);
    if (rule && rule.errorMessage) {
      return rule.errorMessage;
    }
    return unknownErrorMessage;
  }
  return unknownErrorMessage;
};

/**
 * If the function is not a function, throw an error.
 * @param name - The name of the validator function.
 * @param func - The function to check
 */
export const checkValidatorFunction = (name, func) => {
  if (!(func instanceof Function)) {
    throw new Error(buildValidatorFuncErrorMessage(name));
  }
};

export const customValidatorMethods = {
  inArray: (value, list) => list.indexOf(value) !== -1,
  isString: param => typeof param === 'string',
  isNumber: param => !isNaN(Number(param)),
  empty: param => !param,
  notEmpty: param => Boolean(param),
  isObject: param => typeof param === 'object' && Object.keys(param).length > 0,
};

/**
 * It throws an error if the rules parameter is not an array
 * @param rulesParam {Array<string} - The rules parameter.
 */
export const checkRules = rulesParam => {
  if (!(rulesParam instanceof Array)) {
    throw new Error(rulesArgumentTypeErrorMessage);
  }
};

/**
 * It checks if the rulesParam is an object
 */
export const checkValidationData = rulesParam => {
  if (typeof rulesParam !== 'object') {
    throw new Error(validationDataTypeErrorMessage);
  }
};

/**
 * It throws an error if the rule is not an object
 * @param rule - The rule object that is being checked.
 * @param index - The index of the rule in the array of rules.
 */
export const checkRule = (rule, index) => {
  if (!(rule instanceof Object)) {
    throw new Error(buildValidatorTypeErrorMessage(index));
  }
};

/**
 * "If the rule parameter is not a string, throw an error."
 *
 * The function is called checkRuleParam. It takes two parameters: ruleParam and index
 * @param ruleParam - The parameter passed to the rule.
 * @param index - The index of the parameter in the array of parameters.
 */
export const checkRuleParam = (ruleParam, index) => {
  if (typeof ruleParam !== 'string') {
    throw new Error(buildValidatorParamErrorMessage(index));
  }
};

/**
 * If the rulesParam is not an array, throw an error.
 * @param rulesParam - The rules parameter passed to the validator function.
 * @param param - The name of the parameter that is being validated.
 * @param index - the index of the rule in the rules array
 */
export const checkRulesInCurrentRule = (rulesParam, param, index) => {
  if (!(rulesParam instanceof Array)) {
    throw new Error(buildValidatorRulesErrorMessage(param, index));
  }
};

export const buildError = (msg, param, value, elem) => ({
  msg,
  value,
  param,
  elem,
});

/* eslint-disable */
// prettier-ignore
export const buildReadableError = (msg, param, value, elem) =>
  `${msg}! param: "${param}"; value: "${value}";` +
  `${(' element: ' + JSON.stringify(elem))}`;
/* eslint-enable */

export const validateObject = (rulesArray, data) => {
  checkRules(rulesArray);
  checkValidationData(data);
  const errors = [];
  rulesArray.forEach((rule, i) => {
    checkRule(rule, i);
    checkRuleParam(rule.param, i);
    const value = data[rule.param];
    if (!rule.optional || value) {
      checkRulesInCurrentRule(rule.rules, rule.param, i);
      rule.rules.forEach(validatorValue => {
        let validator = validatorValue;
        if (typeof validatorValue === 'string') {
          validator = rules[validatorValue];
          checkValidatorFunction(validatorValue, validator);
        }

        const validatorFunc = customValidatorMethods[validator.name];
        checkValidatorFunction(validator.name, validatorFunc);

        const isValid = validatorFunc(value, validator.options);

        if (!isValid) {
          const errorMessage = validator.errorMessage
            ? validator.errorMessage
            : getErrorMessage(validator.name, validator.options);
          errors.push(buildError(errorMessage, rule.param, value, data));
        }
      });
    }
  });

  return errors;
};

/**
 * It takes a validation object and an array of data, and returns an array of errors
 * @param validationObject - an object that contains the validation rules for the data.
 * @param arrayOfData - an array of objects that you want to validate
 * @returns An array of errors.
 */
export const validateArray = (validationObject, arrayOfData) => {
  let errors = [];
  arrayOfData.forEach(el => {
    errors = errors.concat(validateObject(validationObject, el));
  });
  return errors;
};

/**
 * It takes a validation object and a data object, and returns an object with the keys being the keys
 * of the validation object, and the values being the results of the validation
 * @param validationObject - This is the object that contains the validation rules.
 * @param data - The data to validate.
 * @returns An object with the following properties:
 *   - isValid: boolean
 *   - errors: array of strings
 */
export const validate = (validationObject, data) => {
  if (data instanceof Array) {
    return validateArray(validationObject, data);
  }
  return validateObject(validationObject, data);
};
