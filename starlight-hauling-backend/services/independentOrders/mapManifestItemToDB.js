import omit from 'lodash/fp/omit.js';
import pick from 'lodash/fp/pick.js';

// TODO: move into refactored repo
const mapManifestItemToDB = async (
  ctx,
  { manifestItemRepo, manifestItem, manifestItemsFilesMap = {} },
  trx,
) => {
  const { manifestNumber, unitType } = manifestItem;
  let { materialId } = manifestItem;
  const fileFields = {};
  if (!manifestItem.id || manifestItem.materialChanged) {
    const mappedItem = await manifestItemRepo.getLinkedHistoricalIds(
      pick(['materialId'])(manifestItem),
      {
        update: false,
        entityId: manifestItem.id,
        entityRepo: manifestItemRepo,
      },
      trx,
    );
    ({ materialId } = mappedItem);
    fileFields.unitType = unitType.endsWith('s') ? unitType : `${unitType}s`;
    fileFields.url = manifestItemsFilesMap[manifestNumber]?.url ?? null;
    fileFields.csrName = manifestItemsFilesMap[manifestNumber]?.csrName ?? null;
    fileFields.dispatchId = null;
  }
  return {
    ...omit(['materialChanged'])(manifestItem),
    ...fileFields,
    materialId,
  };
};

export default mapManifestItemToDB;
