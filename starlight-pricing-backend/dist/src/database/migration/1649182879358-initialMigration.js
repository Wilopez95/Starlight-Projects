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
exports.initialMigration1649182879358 = void 0;
class initialMigration1649182879358 {
    up(queryRunner) {
        return __awaiter(this, void 0, void 0, function* () {
            yield queryRunner.query(`ALTER TABLE public.price_groups ALTER COLUMN start_date SET DEFAULT CURRENT_TIMESTAMP`);
            yield queryRunner.query(`CREATE INDEX price_groups_start_at ON public.price_groups (start_date DESC)`);
            yield queryRunner.query(`CREATE INDEX price_groups_end_at ON public.price_groups (end_date ASC NULLS LAST)`);
            yield queryRunner.query(`CREATE INDEX prices_start_at ON public.prices (start_at DESC)`);
            yield queryRunner.query(`CREATE INDEX prices_end_at ON public.prices (end_at ASC NULLS LAST)`);
            yield queryRunner.query(`ALTER TABLE public.prices ALTER COLUMN start_at SET DEFAULT CURRENT_TIMESTAMP`);
            yield queryRunner.query(`CREATE INDEX business_unit_id_status_draft_idx ON public.orders USING btree (business_unit_id, status) WHERE (NOT draft)`);
            yield queryRunner.query(`CREATE INDEX orders_non_invoiced ON public.orders USING btree (invoiced_at) WHERE (invoiced_at IS NULL)`);
            yield queryRunner.query(`CREATE INDEX orders_non_paid ON public.orders USING btree (paid_at) WHERE (paid_at IS NULL)`);
            yield queryRunner.query(`CREATE INDEX line_items_non_invoiced ON public.line_items USING btree (invoiced_at) WHERE (invoiced_at IS NULL)`);
            yield queryRunner.query(`CREATE INDEX line_items_non_paid ON public.line_items USING btree (paid_at) WHERE (paid_at IS NULL)`);
            yield queryRunner.query(`CREATE INDEX threshold_items_non_invoiced ON public.threshold_items USING btree (invoiced_at) WHERE (invoiced_at IS NULL)`);
            yield queryRunner.query(`CREATE INDEX threshold_items_non_paid ON public.threshold_items USING btree (paid_at) WHERE (paid_at IS NULL)`);
            yield queryRunner.query(`CREATE INDEX surcharge_item_non_invoiced ON public.surcharge_item USING btree (invoiced_at) WHERE (invoiced_at IS NULL)`);
            yield queryRunner.query(`CREATE INDEX surcharge_item_non_paid ON public.surcharge_item USING btree (paid_at) WHERE (paid_at IS NULL)`);
            yield queryRunner.query(`CREATE INDEX status_idx ON public.order_requests USING btree (status)`);
            yield queryRunner.query(`CREATE INDEX subscription_service_items_schedule_start_at ON public.subscription_service_items_schedule (start_at DESC)`);
            yield queryRunner.query(`CREATE INDEX subscription_service_items_schedule_end_at ON public.subscription_service_items_schedule (end_at ASC NULLS LAST)`);
            yield queryRunner.query(`CREATE INDEX subscription_recurring_line_items_schedule_start_at ON public.subscription_recurring_line_items_schedule (start_at DESC)`);
            yield queryRunner.query(`CREATE INDEX subscription_recurring_line_items_schedule_end_at ON public.subscription_recurring_line_items_schedule (end_at ASC NULLS LAST)`);
            yield queryRunner.query(`CREATE INDEX subscriptions_periods_start_at ON public.subscriptions_periods (start_at DESC)`);
            yield queryRunner.query(`CREATE INDEX subscriptions_periods_end_at ON public.subscriptions_periods (end_at ASC NULLS LAST)`);
            yield queryRunner.query(`CREATE INDEX subscriptions_periods_non_invoiced ON public.subscriptions_periods (invoiced_at) WHERE invoiced_at IS NULL`);
            yield queryRunner.query(`CREATE INDEX subscriptions_periods_non_paid ON public.subscriptions_periods (paid_at) WHERE paid_at IS NULL`);
            yield queryRunner.query(`CREATE UNIQUE INDEX custom_rates_group_line_items_unique_constraint_idx ON public.custom_rates_group_line_items USING btree (business_unit_id, business_line_id, custom_rates_group_id, line_item_id, COALESCE(material_id, '-1'::integer));`);
            yield queryRunner.query(`CREATE UNIQUE INDEX custom_rates_group_services_unique_constraint_idx ON public.custom_rates_group_services USING btree (business_unit_id, business_line_id, custom_rates_group_id, billable_service_id, COALESCE(material_id, '-1'::integer), equipment_item_id);`);
            yield queryRunner.query(`CREATE INDEX subscriptions_media_updated_at_id ON rolloff_solutions.subscriptions_media USING btree (updated_at DESC);`);
        });
    }
    down(queryRunner) {
        return __awaiter(this, void 0, void 0, function* () {
            yield queryRunner.query(`DROP INDEX IF EXISTS price_groups_start_at`);
            yield queryRunner.query(`DROP INDEX IF EXISTS price_groups_end_at`);
            yield queryRunner.query(`DROP INDEX IF EXISTS prices_start_at`);
            yield queryRunner.query(`DROP INDEX IF EXISTS prices_end_at`);
            yield queryRunner.query(`DROP INDEX IF EXISTS business_unit_id_status_draft_idx`);
            yield queryRunner.query(`DROP INDEX IF EXISTS orders_non_invoiced`);
            yield queryRunner.query(`DROP INDEX IF EXISTS orders_non_paid`);
            yield queryRunner.query(`DROP INDEX IF EXISTS line_items_non_invoiced`);
            yield queryRunner.query(`DROP INDEX IF EXISTS line_items_non_paid`);
            yield queryRunner.query(`DROP INDEX IF EXISTS threshold_items_non_invoiced`);
            yield queryRunner.query(`DROP INDEX IF EXISTS threshold_items_non_paid`);
            yield queryRunner.query(`DROP INDEX IF EXISTS surcharge_item_non_invoiced`);
            yield queryRunner.query(`DROP INDEX IF EXISTS surcharge_item_non_paid`);
            yield queryRunner.query(`DROP INDEX IF EXISTS subscription_service_items_schedule_start_at`);
            yield queryRunner.query(`DROP INDEX IF EXISTS subscription_service_items_schedule_end_at`);
            yield queryRunner.query(`DROP INDEX IF EXISTS subscription_recurring_line_items_schedule_start_at`);
            yield queryRunner.query(`DROP INDEX IF EXISTS subscription_recurring_line_items_schedule_end_at`);
            yield queryRunner.query(`DROP INDEX IF EXISTS subscriptions_periods_start_at`);
            yield queryRunner.query(`DROP INDEX IF EXISTS subscriptions_periods_end_at`);
            yield queryRunner.query(`DROP INDEX IF EXISTS subscriptions_periods_non_invoiced`);
            yield queryRunner.query(`DROP INDEX IF EXISTS subscriptions_periods_non_paid`);
            yield queryRunner.query(`DROP INDEX IF EXISTS status_idx`);
            yield queryRunner.query(`DROP INDEX IF EXISTS custom_rates_group_line_items_unique_constraint_idx`);
            yield queryRunner.query(`DROP INDEX IF EXISTS custom_rates_group_services_unique_constraint_idx`);
            yield queryRunner.query(`DROP INDEX IF EXISTS subscriptions_media_updated_at_id`);
        });
    }
}
exports.initialMigration1649182879358 = initialMigration1649182879358;
//# sourceMappingURL=1649182879358-initialMigration.js.map