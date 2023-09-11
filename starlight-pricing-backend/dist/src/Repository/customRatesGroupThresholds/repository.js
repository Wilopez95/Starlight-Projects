"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.upsertManyCustomRatesGroupThresholds = void 0;
const data_source_1 = require("../../data-source");
const CustomRatesGroupThresholds_1 = require("../../database/entities/tenant/CustomRatesGroupThresholds");
const _ = require("lodash");
const isNumericOrNAN_1 = require("../../utils/isNumericOrNAN");
const upsertManyCustomRatesGroupThresholds = ({ where, oldData, }) => __awaiter(void 0, void 0, void 0, function* () {
    const dataBase = data_source_1.AppDataSource.manager;
    const itemsToRemove = [];
    const data = oldData.filter((item) => {
        var _a, _b;
        item.customRatesGroupId = where.customRatesGroupId;
        item.materialId = (_a = item.materialId) !== null && _a !== void 0 ? _a : null;
        item.equipmentItemId = (_b = item.equipmentItemId) !== null && _b !== void 0 ? _b : null;
        if ((0, isNumericOrNAN_1.isNumericOrNaN)(item.price)) {
            itemsToRemove.push(_.pick(item, ["id"]));
            return;
        }
        return item;
    });
    try {
        if (data === null || data === void 0 ? void 0 : data.length) {
            yield dataBase
                .createQueryBuilder()
                .insert()
                .into(CustomRatesGroupThresholds_1.CustomRatesGroupThresholds)
                .values(data)
                .select("*")
                .execute();
        }
        if (itemsToRemove === null || itemsToRemove === void 0 ? void 0 : itemsToRemove.length) {
            yield dataBase
                .createQueryBuilder()
                .delete()
                .from(CustomRatesGroupThresholds_1.CustomRatesGroupThresholds)
                .where({ where })
                .execute();
        }
    }
    catch (error) {
        throw error;
    }
});
exports.upsertManyCustomRatesGroupThresholds = upsertManyCustomRatesGroupThresholds;
//# sourceMappingURL=repository.js.map