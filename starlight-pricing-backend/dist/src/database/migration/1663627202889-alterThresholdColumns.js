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
exports.alterThresholdColumns1663627202889 = void 0;
class alterThresholdColumns1663627202889 {
    up(queryRunner) {
        return __awaiter(this, void 0, void 0, function* () {
            yield queryRunner.query(`
    DO $$
    DECLARE
            _current_schema varchar;
    BEGIN        
            for _current_schema in select distinct(name) FROM public.tenants
            LOOP
            EXECUTE format('ALTER TABLE %I.threshold_items_historical ADD new_column numeric;', _current_schema);
            EXECUTE format('UPDATE %I.threshold_items_historical SET new_column = price_to_display;', _current_schema);
            EXECUTE format('ALTER TABLE %I.threshold_items_historical DROP price_to_display;', _current_schema);
            EXECUTE format('ALTER TABLE %I.threshold_items_historical RENAME new_column TO price_to_display;', _current_schema);
            END LOOP;
    END $$;
    `);
        });
    }
    down(queryRunner) {
        return __awaiter(this, void 0, void 0, function* () { });
    }
}
exports.alterThresholdColumns1663627202889 = alterThresholdColumns1663627202889;
//# sourceMappingURL=1663627202889-alterThresholdColumns.js.map