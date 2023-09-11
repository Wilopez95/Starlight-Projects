/* global describe, it */
import assert from 'assert';
import {
  nullError,
  getErrorMessage,
  numberError,
  validate,
  rulesArgumentTypeErrorMessage,
  validationDataTypeErrorMessage,
  buildValidatorTypeErrorMessage,
  buildValidatorParamErrorMessage,
  buildValidatorRulesErrorMessage,
  buildError,
  inArrayErrorMessage,
  stringError,
  emptyError,
  objectError,
  unknownErrorMessage,
  checkValidatorFunction,
  buildValidatorFuncErrorMessage,
} from '../../src/utils/validators';

describe('test validators ', () => {
  it('should be error if rules argument is not Array type', () => {
    const rules = 44;

    try {
      validate(rules, {});
    } catch (err) {
      assert.equal(err.message, rulesArgumentTypeErrorMessage);
    }
  });

  it('should be error if validation data is not object type', () => {
    const rules = [];

    try {
      validate(rules, 'hellow');
    } catch (err) {
      assert.equal(err.message, validationDataTypeErrorMessage);
    }
  });

  it('should be error if validator object is not object type', () => {
    const rules = ['hello'];

    try {
      validate(rules, {});
    } catch (err) {
      assert.equal(err.message, buildValidatorTypeErrorMessage(0));
    }
  });

  it('should be error if validator param in not a string type', () => {
    const rules = [{ param: 'size', rules: [] }, {}];

    try {
      validate(rules, {});
    } catch (err) {
      assert.equal(err.message, buildValidatorParamErrorMessage(1));
    }
  });

  it('should be error if validator rules in not a array type', () => {
    const rules = [{ param: 'size' }];

    try {
      validate(rules, {});
    } catch (err) {
      assert.equal(
        err.message,
        buildValidatorRulesErrorMessage(rules[0].param, 0),
      );
    }
  });

  it('should be error if validator function is not function type', () => {
    const name = 'hello';

    try {
      checkValidatorFunction(name, {});
    } catch (err) {
      assert.equal(err.message, buildValidatorFuncErrorMessage(name));
    }
  });

  it('should validate with full validator config setted', () => {
    const data = {
      status: 'STATUS',
      action: 'IS STRING',
      size: 33,
      list: '',
      // material is not defined,
      // material2 - optional
    };
    const actions = ['ASSIGNED'];

    const validators = [
      {
        param: 'status',
        rules: [
          {
            name: 'notEmpty',
            errorMessage: 'status is required',
          },
          {
            name: 'isString',
            // error message set automaticly
          },
          {
            name: 'inArray',
            options: [123],
            // error message set automaticly
          },
        ],
      },
      {
        param: 'action',
        rules: [
          {
            name: 'inArray',
            options: actions,
            errorMessage: 'Value should be in array',
          },
        ],
      },
      {
        param: 'size',
        rules: [
          {
            name: 'isNumber',
          },
        ],
      },
      {
        param: 'list',
        rules: [
          {
            name: 'empty',
          },
        ],
      },
      {
        param: 'material',
        rules: [
          {
            name: 'notEmpty',
          },
        ],
      },
      {
        param: 'material2',
        optional: true,
        rules: [
          {
            name: 'notEmpty',
          },
        ],
      },
    ];

    const errors = validate(validators, data);
    assert.deepEqual(
      errors[0],
      buildError(inArrayErrorMessage, validators[0].param, data.status, data),
    );

    assert.deepEqual(
      errors[1],
      buildError(
        validators[1].rules[0].errorMessage,
        validators[1].param,
        data.action,
        data,
      ),
    );

    assert.deepEqual(
      errors[2],
      buildError(nullError, validators[4].param, data.material, data),
    );
  });

  it('should validate with simple validator config setted', () => {
    const data = {
      status: 'STATUS',
      action: 'IS STRING',
      size: 33,
      list: '',
      material3: 'test',
      material4: {},
      // material is not defined,
      // material2 - optional
    };
    const actions = ['ASSIGNED'];

    const validators = [
      {
        param: 'status',
        rules: [
          'notEmpty',
          'isString',
          {
            name: 'inArray',
            options: [123],
          },
        ],
      },
      {
        param: 'action',
        rules: [
          {
            name: 'inArray',
            options: actions,
          },
        ],
      },
      {
        param: 'size',
        rules: ['isNumber'],
      },
      {
        param: 'list',
        rules: ['empty'],
      },
      {
        param: 'material',
        rules: ['notEmpty'],
      },
      {
        param: 'material2',
        optional: true,
        rules: ['isNumber'],
      },
      {
        param: 'material3',
        rules: ['isObject'],
      },
      {
        param: 'material4',
        rules: ['isObject'],
      },
    ];

    const errors = validate(validators, data);
    assert.deepEqual(
      errors[0],
      buildError(inArrayErrorMessage, validators[0].param, data.status, data),
    );

    assert.deepEqual(
      errors[1],
      buildError(inArrayErrorMessage, validators[1].param, data.action, data),
    );

    assert.deepEqual(
      errors[2],
      buildError(nullError, validators[4].param, data.material, data),
    );
    assert.deepEqual(
      errors[3],
      buildError(objectError, validators[6].param, data.material3, data),
    );
    assert.deepEqual(
      errors[4],
      buildError(objectError, validators[7].param, data.material4, data),
    );
  });

  it('should pass validation', () => {
    const data = {
      status: 'STATUS',
      action: 'ASSIGNED',
      size: 33,
      list: '',
      material: 123,
      // material2 - optional
    };
    const actions = ['ASSIGNED'];

    const validators = [
      {
        param: 'status',
        rules: [
          'notEmpty',
          'isString',
          {
            name: 'inArray',
            options: ['STATUS'],
          },
        ],
      },
      {
        param: 'action',
        rules: [
          {
            name: 'inArray',
            options: actions,
          },
        ],
      },
      {
        param: 'size',
        rules: ['isNumber'],
      },
      {
        param: 'list',
        rules: [],
      },
      {
        param: 'material',
        rules: ['notEmpty'],
      },
      {
        param: 'material2',
        optional: true,
        rules: ['isNumber'],
      },
    ];

    const errors = validate(validators, data);
    assert.deepEqual(errors, []);
  });

  it('should pass validation array', () => {
    const data = [
      {
        status: 'ASSIGNED',
        action: 'PICK UP',
        size: '10',
      },
      {
        status: 'UNASSIGNED',
        action: 'DROPOFF',
        size: '40',
      },
      {
        status: 'CANCELED',
        action: 'FINAL',
        size: '33',
      },
    ];

    const status = ['ASSIGNED', 'UNASSIGNED', 'CANCELED'];
    const actions = ['PICK UP', 'DROPOFF', 'FINAL'];
    const sizes = ['10', '40', '33'];

    const validators = [
      {
        param: 'status',
        rules: [
          'notEmpty',
          'isString',
          {
            name: 'inArray',
            options: status,
          },
        ],
      },
      {
        param: 'action',
        rules: [
          'notEmpty',
          'isString',
          {
            name: 'inArray',
            options: actions,
          },
        ],
      },
      {
        param: 'size',
        rules: [
          'notEmpty',
          'isString',
          {
            name: 'inArray',
            options: sizes,
          },
        ],
      },
    ];

    const errors = validate(validators, data);
    assert.deepEqual(errors, []);
  });

  it('should validate array', () => {
    const data = [
      {
        status: null,
        action: '678',
        size: 44,
      },
      {
        status: 'UNASSIGNED2',
        action: 'DROPOFF2',
        size: '402',
      },
    ];

    const status = ['ASSIGNED', 'UNASSIGNED', 'CANCELED'];
    const actions = ['PICK UP', 'DROPOFF', 'FINAL'];
    const sizes = ['10', '40', '33'];

    const validators = [
      {
        param: 'status',
        rules: [
          'notEmpty',
          'isString',
          {
            name: 'inArray',
            options: status,
          },
        ],
      },
      {
        param: 'action',
        rules: [
          'notEmpty',
          'isString',
          {
            name: 'inArray',
            options: actions,
          },
        ],
      },
      {
        param: 'size',
        rules: [
          'notEmpty',
          'isString',
          {
            name: 'inArray',
            options: sizes,
          },
        ],
      },
    ];

    const errors = validate(validators, data);

    const statusParam = validators[0].param;
    const actionParam = validators[1].param;
    const sizeParam = validators[2].param;

    assert.equal(errors.length, 9);

    assert.deepEqual(
      errors[0],
      buildError(nullError, statusParam, data[0].status, data[0]),
    );

    assert.deepEqual(
      errors[1],
      buildError(stringError, statusParam, data[0].status, data[0]),
    );

    assert.deepEqual(
      errors[2],
      buildError(inArrayErrorMessage, statusParam, data[0].status, data[0]),
    );

    assert.deepEqual(
      errors[3],
      buildError(inArrayErrorMessage, actionParam, data[0].action, data[0]),
    );

    assert.deepEqual(
      errors[4],
      buildError(stringError, sizeParam, data[0].size, data[0]),
    );

    assert.deepEqual(
      errors[5],
      buildError(inArrayErrorMessage, sizeParam, data[0].size, data[0]),
    );

    assert.deepEqual(
      errors[6],
      buildError(inArrayErrorMessage, statusParam, data[1].status, data[1]),
    );

    assert.deepEqual(
      errors[7],
      buildError(inArrayErrorMessage, actionParam, data[1].action, data[1]),
    );

    assert.deepEqual(
      errors[8],
      buildError(inArrayErrorMessage, sizeParam, data[1].size, data[1]),
    );
  });

  it('getErrorMessage should give correct error message when we use simple mode', () => {
    const inArrayMessage = getErrorMessage('inArray');
    const stringMessage = getErrorMessage('isString');
    const numberMessage = getErrorMessage('isNumber');
    const notEmptyMessage = getErrorMessage('notEmpty');
    const emptyMessage = getErrorMessage('empty');
    const isObjectMessage = getErrorMessage('isObject');
    const unknown1 = getErrorMessage();
    const unknown2 = getErrorMessage('blabla');
    const unknown3 = getErrorMessage('blabla', { blabla: () => ({}) });

    assert.equal(inArrayMessage, inArrayErrorMessage);
    assert.equal(stringMessage, stringError);
    assert.equal(numberMessage, numberError);
    assert.equal(notEmptyMessage, nullError);
    assert.equal(emptyMessage, emptyError);
    assert.equal(isObjectMessage, objectError);
    assert.equal(unknown1, unknownErrorMessage);
    assert.equal(unknown2, unknownErrorMessage);
    assert.equal(unknown3, unknownErrorMessage);
  });
});
