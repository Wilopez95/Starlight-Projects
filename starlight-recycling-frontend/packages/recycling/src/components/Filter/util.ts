import { forOwn, groupBy, isArray, keys } from 'lodash-es';
import { SortInput } from '../../graphql/api';
import { FilterSearchValueType } from '../Datatable/fields/SearchValueField';
import { FilterFormValues } from './index';
import { BalanceRangeValue } from '../Datatable/fields/RangeField';

export type FilterObject =
  | {
      terms: {
        [field: string]: unknown[];
      };
    }
  | {
      term: {
        [field: string]: unknown;
      };
    }
  | {
      range: {
        [field: string]: {
          gte?: string;
          lte?: string;
        };
      };
    };

export type ScriptSort = {
  _script: {
    script: string | { lang: string; source: string; params?: any };
    order: 'asc' | 'desc';
    type?: string;
  };
};

export type SearchOrder = 'asc' | 'desc';
export type ModeSort = {
  mode: 'max';
  order: SearchOrder;
};

export type GetSortFuncFilterType = (
  field: string,
  order: SearchOrder,
) => ScriptSort | { [key: string]: SearchOrder | ModeSort };

export type GetFilterByFieldFuncType = (
  field: string,
  value: unknown[],
) => FilterObject | FilterObject[] | undefined;

type GetSearchBodyParamsType = {
  page?: number;
  perPage: number;
  currentSort: SortInput | SortInput[];
  filter: FilterFormValues['fields'];
  query?: string | null | undefined;
  getSort?: GetSortFuncFilterType;
  getFilterByField?: GetFilterByFieldFuncType;
  fields?: string[];
};

const getDefaultSort: GetSortFuncFilterType = (field, order) => ({ [field]: order });
const getDefaultFilterByField: GetFilterByFieldFuncType = (field, value) => ({
  terms: {
    [field]: value,
  },
});

function buildFilters(
  fields: FilterFormValues['fields'],
  getFilterByField: GetFilterByFieldFuncType = getDefaultFilterByField,
): FilterObject[] | undefined {
  const filteredFields = fields.filter((field) => keys(field).length > 0);

  if (filteredFields.length === 0) {
    return;
  }

  const filters: FilterObject[] = [];
  const groupByField: { [key: string]: FilterFormValues['fields'] } = groupBy(
    filteredFields,
    'field',
  );
  forOwn(groupByField, (values, field) => {
    const value = values.flatMap((obj) => {
      if (isArray(obj.value)) {
        return obj.value.map((v: FilterSearchValueType | BalanceRangeValue | unknown) => {
          if (v && typeof v === 'object') {
            if ((v as FilterSearchValueType).value) {
              return (v as FilterSearchValueType).value;
            }
          }

          return v;
        });
      }

      return obj.value;
    });

    // TODO we might need to allow empty values for some fields
    if (isArray(value) && !value[0]) {
      return;
    }

    const filterObj = getFilterByField(field, value);

    if (filterObj) {
      if (isArray(filterObj)) {
        filters.push(...filterObj);
      } else {
        filters.push(filterObj);
      }
    }
  });

  return filters;
}

export function getSearchBody(params: GetSearchBodyParamsType) {
  const {
    page = 0,
    perPage,
    currentSort,
    query,
    filter,
    getSort = getDefaultSort,
    getFilterByField,
    fields,
  } = params;

  return {
    from: page * perPage,
    size: perPage,
    sort: isArray(currentSort)
      ? currentSort.map((sort) => getSort(sort.field, sort.order.toLowerCase() as 'asc' | 'desc'))
      : [getSort(currentSort.field, currentSort.order.toLowerCase() as 'asc' | 'desc')],
    query: {
      bool: {
        must: query
          ? [
              {
                multi_match: {
                  query: query,
                  type: 'cross_fields',
                  operator: 'and',
                  fields,
                },
              },
            ]
          : undefined,
        filter: buildFilters(filter, getFilterByField),
      },
    },
    highlight: {
      require_field_match: false,
      pre_tags: ['<b>'],
      post_tags: ['</b>'],
      fields: {
        '*': {
          number_of_fragments: 1,
        },
      },
    },
  };
}
