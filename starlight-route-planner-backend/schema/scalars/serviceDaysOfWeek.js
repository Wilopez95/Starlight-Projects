import { Kind, GraphQLScalarType } from 'graphql';
import { ValidationError } from 'apollo-server-core';
import { SERVICE_DAYS_PARAMS } from '../../consts/serviceDays.js';

const isValidDay = value => {
  try {
    const number = Number.parseInt(value, 10);

    if (number >= 0 && number <= 6) return true;
  } catch (e) {
    return false;
  }

  return false;
};

const validDayParams = [SERVICE_DAYS_PARAMS.route, SERVICE_DAYS_PARAMS.requiredByCustomer];

const ensureObject = value => {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    throw new ValidationError(`ServiceDaysOfWeek cannot represent non-object value: ${value}`);
  }

  const days = Object.keys(value);

  const invalidDays = days.filter(day => !isValidDay(day));
  if (invalidDays.length) {
    throw new ValidationError(
      `ServiceDaysOfWeek can only have valid day numbers as keys [0..6]: ${invalidDays}`,
    );
  }

  days.forEach(day => {
    if (!Object.keys(value[day]).every(param => validDayParams.includes(param))) {
      throw new ValidationError(
        `ServiceDaysOfWeek day param can only have predefined keys ${validDayParams}. Check params for day: ${day}`,
      );
    }
  });

  return value;
};

const parseLiteral = ast => {
  switch (ast.kind) {
    case Kind.BOOLEAN:
      return ast.value;
    case Kind.INT:
      return parseInt(ast.value, 10);
    default:
      return null;
  }
};

const parseObject = ast => {
  if (ast.fields.some(field => !isValidDay(field.name.value))) {
    return null;
  }

  const value = {};

  ast.fields.forEach(field => {
    value[field.name.value] = parseLiteral(field.value);
  });

  return value;
};

export const resolver = {
  ServiceDaysOfWeek: new GraphQLScalarType({
    name: 'ServiceDaysOfWeek',
    description: 'The `ServiceDaysOfWeek` scalar type represents JSON objects with keys as days',
    serialize: ensureObject,
    parseValue: ensureObject,
    parseLiteral: parseObject,
  }),
};
