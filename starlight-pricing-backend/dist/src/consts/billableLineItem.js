"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BillableItemActionEnum = exports.BillableLineItemUnitTypeEnum = void 0;
var BillableLineItemUnitTypeEnum;
(function (BillableLineItemUnitTypeEnum) {
    BillableLineItemUnitTypeEnum["NONE"] = "none";
    BillableLineItemUnitTypeEnum["EACH"] = "each";
    BillableLineItemUnitTypeEnum["TON"] = "ton";
    BillableLineItemUnitTypeEnum["YARD"] = "yard";
    BillableLineItemUnitTypeEnum["GALLON"] = "gallon";
    BillableLineItemUnitTypeEnum["MILE"] = "mile";
    BillableLineItemUnitTypeEnum["MIN"] = "min";
    BillableLineItemUnitTypeEnum["HOUR"] = "hour";
    BillableLineItemUnitTypeEnum["DAY"] = "day";
    BillableLineItemUnitTypeEnum["WEEK"] = "week";
    BillableLineItemUnitTypeEnum["MONTH"] = "month";
    BillableLineItemUnitTypeEnum["ORDER"] = "order";
})(BillableLineItemUnitTypeEnum = exports.BillableLineItemUnitTypeEnum || (exports.BillableLineItemUnitTypeEnum = {}));
var BillableItemActionEnum;
(function (BillableItemActionEnum) {
    BillableItemActionEnum["none"] = "none";
    BillableItemActionEnum["delivery"] = "delivery";
    BillableItemActionEnum["switch"] = "switch";
    BillableItemActionEnum["final"] = "final";
    BillableItemActionEnum["relocate"] = "relocate";
    BillableItemActionEnum["reposition"] = "reposition";
    BillableItemActionEnum["dumpReturn"] = "dump&Return";
    BillableItemActionEnum["liveLoad"] = "liveLoad";
    BillableItemActionEnum["generalPurpose"] = "generalPurpose";
    BillableItemActionEnum["rental"] = "rental";
    BillableItemActionEnum["service"] = "service";
    BillableItemActionEnum["nonService"] = "notService";
    BillableItemActionEnum["dump"] = "dump";
    BillableItemActionEnum["load"] = "load";
})(BillableItemActionEnum = exports.BillableItemActionEnum || (exports.BillableItemActionEnum = {}));
//# sourceMappingURL=billableLineItem.js.map