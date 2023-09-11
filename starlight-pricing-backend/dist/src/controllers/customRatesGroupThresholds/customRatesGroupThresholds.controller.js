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
exports.CustomRatesGroupThresholdsController = void 0;
const CustomRatesGroupThresholds_1 = require("../../database/entities/tenant/CustomRatesGroupThresholds");
const CustomRatesGroupThresholdsHistorical_1 = require("../../database/entities/tenant/CustomRatesGroupThresholdsHistorical");
const base_controller_1 = require("../base.controller");
class CustomRatesGroupThresholdsController extends base_controller_1.BaseController {
    constructor() {
        super();
    }
    addCustomRatesGroupThresholds(ctx, next) {
        const _super = Object.create(null, {
            insert: { get: () => super.insert }
        });
        return __awaiter(this, void 0, void 0, function* () {
            return _super.insert.call(this, ctx, next, CustomRatesGroupThresholds_1.CustomRatesGroupThresholds, CustomRatesGroupThresholdsHistorical_1.CustomRatesGroupThresholdsHistorical);
        });
    }
    updateCustomRatesGroupThresholds(ctx, next) {
        const _super = Object.create(null, {
            update: { get: () => super.update }
        });
        return __awaiter(this, void 0, void 0, function* () {
            let id = +ctx.url.split("/")[2];
            return _super.update.call(this, ctx, next, CustomRatesGroupThresholds_1.CustomRatesGroupThresholds, CustomRatesGroupThresholdsHistorical_1.CustomRatesGroupThresholdsHistorical, id);
        });
    }
}
exports.CustomRatesGroupThresholdsController = CustomRatesGroupThresholdsController;
//# sourceMappingURL=customRatesGroupThresholds.controller.js.map