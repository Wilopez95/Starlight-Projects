import { getDateFromTemplate } from './getDateFromTemplate.js';

export const templateMap = (ctx, { templates, today }) =>
  templates.reduce(
    (acc, template) => {
      const templateDate = getDateFromTemplate(ctx, {
        template,
        today,
      });

      if (!templateDate) {
        return acc;
      }

      const { subOrdersData, serviceItemInfo } = templateDate;

      return {
        subOrders: [...acc.subOrders, ...subOrdersData],
        serviceItemMap: { ...acc.serviceItemMap, ...serviceItemInfo },
      };
    },
    {
      subOrders: [],
      serviceItemMap: {},
    },
  );
