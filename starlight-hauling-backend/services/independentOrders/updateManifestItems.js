import ManifestItemRepo from '../../repos/manifestItems.js';

import actualizeManifestLineItems from './actualizeManifestLineItems.js';
import mapManifestItemToDB from './mapManifestItemToDB.js';

const updateManifestItems = async (
  ctx,
  {
    oldOrder,
    lineItems = [],
    manifestItemsToEdit = [],
    manifestItemsToAdd = [],
    inputManifestFiles = [],
    save = false,
  },
  trx,
) => {
  ctx.logger.debug(`updateManifestItems->oldOrder: ${JSON.stringify(oldOrder, null, 2)}`);
  ctx.logger.debug(
    `updateManifestItems->manifestItemsToEdit: ${JSON.stringify(manifestItemsToEdit, null, 2)}`,
  );
  ctx.logger.debug(
    `updateManifestItems->manifestItemsToAdd: ${JSON.stringify(manifestItemsToAdd, null, 2)}`,
  );
  ctx.logger.debug(
    `updateManifestItems->inputManifestFiles: ${JSON.stringify(inputManifestFiles, null, 2)}`,
  );

  const manifestItemRepo = ManifestItemRepo.getInstance(ctx.state);

  try {
    const { manifestItemsToEditMap } = manifestItemsToEdit.reduce(
      (res, item) => {
        res.manifestItemsToEditMap[item.id] = item;
        return res;
      },
      { manifestItemsToEditMap: {}, manifestItemsFilesMap: {} },
    );
    const { manifestItemsFilesMap } = manifestItemsToAdd.reduce(
      (res, item, index) => {
        if (inputManifestFiles[index]) {
          res.manifestItemsFilesMap[item.manifestNumber] = inputManifestFiles[index];
        }
        return res;
      },
      {
        manifestItemsToEditMap: {},
        manifestItemsFilesMap: {},
        manifestItemsToEdit: [],
        manifestItemsToAdd: [],
      },
    );
    const { manifestItemsToDeleteIds } = (oldOrder.manifestItems || []).reduce(
      (res, item) => {
        if (!manifestItemsToEditMap[item.id]) {
          res.manifestItemsToDeleteIds.push(item.id);
        } else if (manifestItemsToEditMap[item.id].materialId !== item.materialId) {
          // there is a chance to get equal values for different materials:
          // because we can get original ID of the wood materials and compare with historical ID of the metal material
          // they can be equal because we're getting them from different tables
          // (historical for a value from DB and original for a change value from FE)
          // solution to use always latest historical IDs (like it works now)
          // means that we always re-create items to the latest versions (if differs)
          // TODO: discuss possible solutions (all I can imaging affects FE)
          // TODO: clarify with BA, commented because currently in roll-off it's not supported to update manifest items
          // manifestItemsToEditMap[item.id].materialChanged = true;
        }
        return res;
      },
      { manifestItemsToDeleteIds: [] },
    );

    // TODO: completely refactor this to really use bulk DB operations instead of lists of nested promises with single DB operations
    //  https://starlightpro.atlassian.net/browse/HAULING-6543
    const [
      manifestItemsToInsert,
      // TODO: clarify with BA, commented because currently in roll-off it's not supported to update manifest items
      // manifestItemsToUpdate,
    ] = await Promise.all([
      Promise.all(
        manifestItemsToAdd.map(item =>
          mapManifestItemToDB(manifestItemRepo, item, manifestItemsFilesMap),
        ),
      ),
      // TODO: clarify with BA, commented because currently in roll-off it's not supported to update manifest items
      // Promise.all(manifestItemsToEdit.map((item) => mapManifestItemToDB(manifestItemRepo, item, manifestItemsFilesMap))),
    ]);

    const { existingManifestLineItems = [], existingManifestLineItemsMap = {} } =
      lineItems.reduce(
        (res, item) => {
          if (item.manifestNumber) {
            existingManifestLineItems.push(item);
            if (!existingManifestLineItemsMap[item.manifestNumber]) {
              existingManifestLineItemsMap[item.manifestNumber] = [];
            }
            existingManifestLineItemsMap[item.manifestNumber].push(item);
          }
          return res;
        },
        { existingManifestLineItems: [], existingManifestLineItemsMap: {} },
      ) ?? {};
    ctx.logger.debug(
      `updateManifestItems->existingManifestLineItems: ${JSON.stringify(
        existingManifestLineItems,
        null,
        2,
      )}`,
    );
    ctx.logger.debug(
      `updateManifestItems->existingManifestLineItemsMap: ${JSON.stringify(
        existingManifestLineItemsMap,
        null,
        2,
      )}`,
    );

    let manifestItems = [];
    if (save && manifestItemsToInsert.length) {
      const [
        addedManifestItems,
        // TODO: clarify with BA, commented because currently in roll-off it's not supported to update manifest items
        // updatedManifestItems,
      ] = await Promise.all([
        manifestItemsToInsert.length
          ? manifestItemRepo.insertMany(
              {
                data: manifestItemsToInsert,
                fields: ['id'],
              },
              trx,
            )
          : null,
        // TODO: clarify with BA, commented because currently in roll-off it's not supported to update manifest items
        // manifestItemsToUpdate.length
        //   ? manifestItemRepo.upsertItems(
        //       {
        //         data: manifestItemsToUpdate,
        //         fields: ['id'],
        //       },
        //       trx,
        //     )
        //   : null,
        manifestItemRepo.deleteByIds({ ids: manifestItemsToDeleteIds }, trx),
      ]);
      const ids = [
        ...addedManifestItems,
        // TODO: clarify with BA, commented because currently in roll-off it's not supported to update manifest items
        // ...updatedManifestItems,
        ...manifestItemsToEdit, // TODO: remove if the line above will be confirmed and uncommented
      ].map(({ id }) => id);
      ctx.logger.debug(`updateManifestItems->ids: ${JSON.stringify(ids, null, 2)}`);

      manifestItems = (await manifestItemRepo.populateManifestItemsByIds(ids, trx)) ?? [];
    } else {
      manifestItems = [...manifestItemsToInsert, ...manifestItemsToEdit];
    }
    ctx.logger.debug(
      `updateManifestItems->manifestItems: ${JSON.stringify(manifestItems, null, 2)}`,
    );

    const {
      lineItemsToKeep = [],
      lineItemsToDelete = [],
      addedLineItems = [],
    } = manifestItems?.length
      ? await actualizeManifestLineItems(
          ctx,
          { oldOrder, manifestItems, existingManifestLineItemsMap, save },
          trx,
        )
      : {};

    if (!manifestItems?.length && existingManifestLineItems.length) {
      lineItemsToDelete.push(...existingManifestLineItems);
    }

    return {
      manifestItems,
      lineItemsToKeep,
      lineItemsToDelete,
      addedLineItems,
    };
  } catch (error) {
    ctx.logger.error(
      error,
      `Error while updating manifest items for an order with id ${oldOrder.id}`,
    );
    throw error;
  }
};

export default updateManifestItems;
