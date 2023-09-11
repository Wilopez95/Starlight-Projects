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
exports.upsertManyCustomRatesGroupSurcharges = void 0;
const data_source_1 = require("../../data-source");
const CustomRatesGroupSurcharges_1 = require("../../database/entities/tenant/CustomRatesGroupSurcharges");
const _ = require("lodash");
const isNumericOrNAN_1 = require("../../utils/isNumericOrNAN");
const upsertManyCustomRatesGroupSurcharges = ({ where, oldData, }) => __awaiter(void 0, void 0, void 0, function* () {
    const dataBase = data_source_1.AppDataSource.manager;
    const itemsToRemove = [];
    const data = oldData.filter((item) => {
        var _a;
        item.customRatesGroupId = where.customRatesGroupId;
        item.materialId = (_a = item.materialId) !== null && _a !== void 0 ? _a : null;
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
                .into(CustomRatesGroupSurcharges_1.CustomRatesGroupSurcharges)
                .values(data)
                .select("*")
                .execute();
        }
        if (itemsToRemove === null || itemsToRemove === void 0 ? void 0 : itemsToRemove.length) {
            yield dataBase
                .createQueryBuilder()
                .delete()
                .from(CustomRatesGroupSurcharges_1.CustomRatesGroupSurcharges)
                .where({ where })
                .execute();
        }
    }
    catch (error) {
        throw error;
    }
});
exports.upsertManyCustomRatesGroupSurcharges = upsertManyCustomRatesGroupSurcharges;
//# sourceMappingURL=repository.js.map