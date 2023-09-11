import mapKeys from 'lodash/fp/mapKeys.js';
import camelCase from 'lodash/fp/camelCase.js';
import compose from 'lodash/fp/compose.js';
import pick from 'lodash/fp/pick.js';
import isEmpty from 'lodash/isEmpty.js';
import compact from 'lodash/compact.js';
import snakeCase from 'lodash/snakeCase.js';

export const addressFields = ['addressLine1', 'addressLine2', 'city', 'state', 'zip'];
export const phoneNumberFields = ['id', 'type', 'number', 'extension', 'textOnly'];

export const camelCaseKeys = mapKeys(camelCase);

export const tabAddressFields = obj => {
  Object.entries(obj)
    .filter(([key]) => addressFields.includes(key))
    .forEach(([key, value]) => {
      if (obj.address) {
        obj.address[key] = value;
      } else {
        obj.address = { [key]: value };
      }
      delete obj[key];
    });
  return obj;
};

export const omitPhoneNumberFields = obj => {
  if (!isEmpty(obj.phoneNumbers)) {
    const pickFields = compose(pick(phoneNumberFields), camelCaseKeys);
    const phoneNumbers = compact(obj.phoneNumbers).map(pickFields);
    obj.phoneNumbers = phoneNumbers;
  }
  return obj;
};

export const putLocationField = obj => {
  if (obj.location && obj.location.type !== 'Point') {
    obj.location = {
      type: 'Point',
      coordinates: obj.coordinates,
    };
  }
  return obj;
};

export const unambiguousCondition = (tableName, condition) =>
  typeof condition !== 'function'
    ? mapKeys(key => (key.includes('.') ? key : `${tableName}.${key}`))(condition)
    : condition;

export const unambiguousTupleCondition = (tableName, tupleConditions) =>
  tupleConditions?.map(tupleCondition =>
    tupleCondition[0].includes('.')
      ? [tupleCondition[0], tupleCondition[1], tupleCondition[2]]
      : [`${tableName}.${tupleCondition[0]}`, tupleCondition[1], tupleCondition[2]],
  );

export const unambiguousSelect = (tableName, fields) =>
  fields.map(field => (field.includes('.') ? field : `${tableName}.${field}`));

export const resolveSelect = (
  { alias, fields = [], allColumns = [], uniquenessColumns = [], aggregatesSelector },
  trx,
) => {
  let fieldsToResolve = [...fields];
  const wildcardIndex = fieldsToResolve.findIndex(field => field === '*');
  if (wildcardIndex >= 0) {
    fieldsToResolve.splice(wildcardIndex, 1);
    fieldsToResolve = Array.from(new Set([...fieldsToResolve, ...allColumns]));
  }

  return fieldsToResolve.map(field => {
    const rawField = snakeCase(field);
    let selection = rawField.includes('.') ? rawField : `${alias}.${rawField}`;
    if (!uniquenessColumns.includes(field)) {
      selection = `${aggregatesSelector}(${selection}) as ${rawField}`;
    }
    return trx.raw(selection);
  });
};

export const unambiguousField = (tableName, field) =>
  field.includes('.') ? field : `${tableName}.${field}`;

export const unambiguousSelectSlots = (tableName, fields) =>
  fields.map(field => (field.includes('.') ? '??' : `${tableName}.??`));

export const mapAddressFields = obj => {
  Object.entries(obj)
    .filter(([key]) => key.startsWith('mailing') || key.startsWith('physical'))
    .forEach(([key, value]) => {
      const addressField = camelCase(key.slice(key.startsWith('physical') ? 8 : 7));
      if (addressFields.includes(addressField)) {
        const field = key.startsWith('mailing') ? 'mailingAddress' : 'physicalAddress';
        if (obj[field]) {
          obj[field][addressField] = value;
        } else {
          obj[field] = { [addressField]: value };
        }
        delete obj[key];
      }
    });

  return obj;
};

export const proceedInBatches = async (
  { repo, condition, fields, orderByField, limit = 100, lastId, count = 0, cb },
  trx,
) => {
  let nextId = lastId;

  const items = await repo
    .getAll(
      {
        condition,
        fields,
        orderBy: [orderByField],
      },
      trx,
    )
    .where(orderByField, '>=', lastId)
    .orderBy([orderByField])
    .limit(limit + 1);

  if (!items?.length) {
    return count;
  }

  let hasMoreItems = false;
  if (items.length > limit) {
    hasMoreItems = true;
    nextId = items.pop()[orderByField];
  }

  await cb(items);

  if (!hasMoreItems) {
    // eslint-disable-next-line no-constant-binary-expression, no-unsafe-optional-chaining
    return +count + items?.length ?? 0;
  }

  return proceedInBatches({
    repo,
    condition,
    fields,
    orderByField,
    limit,
    lastId: nextId,
    count: count + limit,
    cb,
  });
};

export const processVal = val => {
  if (typeof val !== 'object' || val === null) {
    return val;
  }
  if (Array.isArray(val)) {
    return val.map(processVal);
  }
  return renameKeys(val);
};

function renameKeys(obj) {
  return Object.fromEntries(
    Object.entries(obj).map(([key, val]) => [
      key.replace(/_(.)/g, g => g[1].toUpperCase()),
      processVal(val),
    ]),
  );
}

const splitAndTrim = (separator, emails) => emails.split(separator).map(s => s.trim());

export const parseArrayOfEmails = (obj, field) => {
  if (obj[field]?.[0]) {
    if (obj[field][0]?.includes(';')) {
      obj[field] = obj[field].flatMap(splitAndTrim.bind(undefined, ';'));
    }
    if (obj[field][0]?.includes(':')) {
      obj[field] = obj[field].flatMap(splitAndTrim.bind(undefined, ':'));
    }
  }
};

export const getDuplicatedRecordsIds = async ({ knex, table, uniqueKeyFields }) => {
  const data = await knex(table)
    .select([knex.raw('array_agg(id order by id desc) as ids'), ...uniqueKeyFields])
    .groupBy(uniqueKeyFields)
    .havingRaw('count(*) > 1');

  return (
    data?.reduce((acc, curr) => {
      // leave first inserted record
      curr.ids.pop();
      acc.push(...curr.ids);
      return acc;
    }, []) ?? []
  );
};

export const removeWhereIn = ({ knex, table, field, values }) =>
  values?.length ? knex(table).whereIn(field, values).del() : null;
