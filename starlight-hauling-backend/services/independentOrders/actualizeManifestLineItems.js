import BillableLineItemRepo from '../../repos/billableLineItem.js';

import { LINE_ITEM_TYPE } from '../../consts/lineItemTypes.js';
import addLineItems from './addLineItems.js';

const actualizeManifestLineItems = async (
  ctx,
  { oldOrder, manifestItems = [], existingManifestLineItemsMap = {}, save = false },
  trx,
) => {
  ctx.logger.debug(`actualizeManifestLineItems->oldOrder: ${JSON.stringify(oldOrder, null, 2)}`);
  ctx.logger.debug(
    `actualizeManifestLineItems->manifestItems: ${JSON.stringify(manifestItems, null, 2)}`,
  );
  ctx.logger.debug(
    `actualizeManifestLineItems->existingManifestLineItemsMap: ${JSON.stringify(
      existingManifestLineItemsMap,
      null,
      2,
    )}`,
  );

  const lineItemRepo = BillableLineItemRepo.getInstance(ctx.state);

  let addedLineItems = [];
  try {
    const {
      businessLine: { id: businessLineId },
    } = oldOrder;

    const [
      { id: billableLineItemByTonId, ...bliByTon } = {},
      { id: billableLineItemByYardId, ...bliByYard } = {},
    ] = await Promise.all([
      lineItemRepo.getBy(
        {
          condition: {
            type: LINE_ITEM_TYPE.manifestedDisposalByTon,
            businessLineId,
            active: true,
          },
          fields: ['id', 'applySurcharges', 'materialBasedPricing'],
        },
        trx,
      ),
      lineItemRepo.getBy(
        {
          condition: {
            type: LINE_ITEM_TYPE.manifestedDisposalByYard,
            businessLineId,
            active: true,
          },
          fields: ['id', 'applySurcharges', 'materialBasedPricing'],
        },
        trx,
      ),
    ]);
    ctx.logger.debug(`actualizeManifestLineItems->bliByTon: ${JSON.stringify(bliByTon, null, 2)}`);
    ctx.logger.debug(
      `actualizeManifestLineItems->bliByYard: ${JSON.stringify(bliByYard, null, 2)}`,
    );
    if (!billableLineItemByTonId || !billableLineItemByYardId) {
      ctx.logger.error('No billable line items configured for manifests');
      return {
        lineItemsToKeep: Object.values(existingManifestLineItemsMap),
        lineItemsToDelete: [],
        addedLineItems: [],
      };
      // pre-pricing service code:
      // } else {
      //   const { lineItemsToAdd, lineItemsToKeep, lineItemsToDelete } = manifestItems.reduce(
      //     (res, item) => {
      //       if (existingManifestLineItemsMap[item.manifestNumber]?.length) {
      //         if (
      //           existingManifestLineItemsMap[item.manifestNumber].length === 2 &&
      //           existingManifestLineItemsMap[item.manifestNumber].every(
      //             lineItem => lineItem.materialId === item.materialId,
      //           )
      //         ) {
      //           res.lineItemsToKeep.push(...existingManifestLineItemsMap[item.manifestNumber]);
      //         } else {
      //           res.lineItemsToDelete.push(...existingManifestLineItemsMap[item.manifestNumber]);
      //           res.lineItemsToAdd.push(
      //             {
      //               ...bliByTon,
      //               billableLineItemId: billableLineItemByTonId,
      //               materialId: item.materialId,
      //               quantity: 1,
      //               manifestNumber: item.manifestNumber,
      //             },
      //             {
      //               ...bliByYard,
      //               billableLineItemId: billableLineItemByYardId,
      //               materialId: item.materialId,
      //               quantity: 1,
      //               manifestNumber: item.manifestNumber,
      //             },
      //           );
      //         }
      // end pre-pricing service code
    }
    const { lineItemsToAdd, lineItemsToKeep, lineItemsToDelete } = manifestItems.reduce(
      (res, item) => {
        if (existingManifestLineItemsMap[item.manifestNumber]?.length) {
          if (
            existingManifestLineItemsMap[item.manifestNumber].length === 2 &&
            existingManifestLineItemsMap[item.manifestNumber].every(
              lineItem => lineItem.materialId === item.materialId,
            )
          ) {
            res.lineItemsToKeep.push(...existingManifestLineItemsMap[item.manifestNumber]);
            // end of post-pricing service code
          } else {
            res.lineItemsToDelete.push(...existingManifestLineItemsMap[item.manifestNumber]);
            res.lineItemsToAdd.push(
              {
                ...bliByTon,
                billableLineItemId: billableLineItemByTonId,
                materialId: item.materialId,
                quantity: 1,
                manifestNumber: item.manifestNumber,
              },
              {
                ...bliByYard,
                billableLineItemId: billableLineItemByYardId,
                materialId: item.materialId,
                quantity: 1,
                manifestNumber: item.manifestNumber,
              },
            );
          }
          // pre-pricing service code:
          //     return res;
          //   },
          //   { lineItemsToAdd: [], lineItemsToKeep: [], lineItemsToDelete: [] },
          // );
          // ctx.logger.debug(
          //   `actualizeManifestLineItems->lineItemsToAdd: ${JSON.stringify(lineItemsToAdd, null, 2)}`,
          // );
          // ctx.logger.debug(
          //   `actualizeManifestLineItems->lineItemsToKeep: ${JSON.stringify(lineItemsToKeep, null, 2)}`,
          // );
          // ctx.logger.debug(
          //   `actualizeManifestLineItems->lineItemsToDelete: ${JSON.stringify(
          //     lineItemsToDelete,
          //     null,
          //     2,
          //   )}`,
          // );

          // addedLineItems = await addLineItems(
          //   ctx,
          //   { order: oldOrder, lineItems: lineItemsToAdd, save },
          //   trx,
          // );
          // ctx.logger.debug(
          //   `actualizeManifestLineItems->addedLineItems: ${JSON.stringify(addedLineItems, null, 2)}`,
          // );
          // end of pre-pricing service code
        } else {
          res.lineItemsToAdd.push(
            {
              ...bliByTon,
              billableLineItemId: billableLineItemByTonId,
              materialId: item.materialId,
              quantity: 1,
              manifestNumber: item.manifestNumber,
            },
            {
              ...bliByYard,
              billableLineItemId: billableLineItemByYardId,
              materialId: item.materialId,
              quantity: 1,
              manifestNumber: item.manifestNumber,
            },
          );
        }
        return res;
      },
      { lineItemsToAdd: [], lineItemsToKeep: [], lineItemsToDelete: [] },
    );
    ctx.logger.debug(
      `actualizeManifestLineItems->lineItemsToAdd: ${JSON.stringify(lineItemsToAdd, null, 2)}`,
    );
    ctx.logger.debug(
      `actualizeManifestLineItems->lineItemsToKeep: ${JSON.stringify(lineItemsToKeep, null, 2)}`,
    );
    ctx.logger.debug(
      `actualizeManifestLineItems->lineItemsToDelete: ${JSON.stringify(
        lineItemsToDelete,
        null,
        2,
      )}`,
    );

    addedLineItems = await addLineItems(
      ctx,
      { order: oldOrder, lineItems: lineItemsToAdd, save },
      trx,
    );
    ctx.logger.debug(
      `actualizeManifestLineItems->addedLineItems: ${JSON.stringify(addedLineItems, null, 2)}`,
    );
    // end of post-pricing service code

    if (save) {
      await lineItemRepo.deleteByIds({ ids: lineItemsToDelete.map(({ id }) => id) }, trx);
    }

    return { lineItemsToKeep, lineItemsToDelete, addedLineItems };
  } catch (error) {
    ctx.logger.error(
      error,
      `Error while generating line items by manifest items for an order with id ${oldOrder.id}`,
    );
    throw error;
  }
};

export default actualizeManifestLineItems;
