import MaterialRepo from './materialRepo.js';
import BillableServiceRepo from './billableServiceRepo.js';
import EquipmentItemRepo from './equipmentItemRepo.js';
import BillableLineItemRepo from './billableLineItemRepo.js';
import PriceGroupRepo from './priceGroupRepo.js';
import PricesRepo from './pricesRepo.js';

const repos = {
  BillableLineItemRepo,
  BillableServiceRepo,
  EquipmentItemRepo,
  MaterialRepo,
  PriceGroupRepo,
  PricesRepo,
};

export default repos;
