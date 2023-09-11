export const up = migrationBuilder =>
  migrationBuilder.raw(`
    drop view profitability_items;
    create view profitability_items as
      select o.id, case when tax_case.taxable then o.grand_total else o.before_taxes_total + o.surcharges_total end as grand_total,
      o.surcharges_total as surcharges_total, tax_case.taxable as with_taxes, o.service_date, o.work_order_id, o.business_unit_id,
      o.grand_total - o.before_taxes_total - o.surcharges_total as taxes_total, o.grand_total as gross_total,
      o.billable_service_total + coalesce(surcharges_total.service_sum, 0) as service_total,
      o.billable_line_items_total + coalesce(o.thresholds_total, 0) + coalesce(surcharges_total.items_sum, 0) as line_items_total,
      o.billable_line_items_total + coalesce(o.thresholds_total, 0) + o.billable_service_total + o.surcharges_total as revenue,
      coalesce(w.weight, 0) as disposal_weight, w.weight_unit as disposal_weight_unit, coalesce(w.haul_hours, 0) as haul_hours,
      tdc.id as truck_driver_costs_id, coalesce(tdc.average_cost, 0) as truck_driver_gross_rate,
      coalesce((case
        when tdc.detailed_costs
          then coalesce(tc.fuel_cost + tc.misc_average_cost + tc.insurance_cost + tc.maintenance_cost + tc.depreciation_cost,
            ttc.fuel_cost + ttc.misc_average_cost + ttc.insurance_cost + ttc.maintenance_cost + ttc.depreciation_cost,
            tdc.truck_average_cost, 0)
          else coalesce(tc.truck_average_cost, ttc.truck_average_cost, tdc.truck_average_cost, 0)
        end * w.haul_hours), 0) as truck_costs,
      coalesce((coalesce(dc.driver_average_cost, tdc.driver_average_cost, 0) * w.haul_hours), 0) as driver_costs,
      dsr.id as disposal_site_rate_id, coalesce(dsr.rate, 0) as disposal_rate, dsr.unit as disposal_unit,
      coalesce(case when dsr.unit = w.weight_unit then w.weight * dsr.rate else 0 end, 0) as disposal_cost,
      sr.user_id as sales_id, coalesce(sr.value, 0) as sales_rate,
      round(coalesce((o.billable_line_items_total + coalesce(o.thresholds_total, 0)
        + o.billable_service_total + o.surcharges_total) * sr.value / 100, 0), 2) as sales_cost,
      m.id as material_id, m.description as material_description,
      b.id as billable_service_id, b.description as billable_service_description,
      e.id as equipment_items_id, e.description as equipment_item_description, e.short_description as equipment_item_short_description,
      tph.id as third_party_hauler_id, tph.description as third_party_hauler_description,
      coalesce(tphcm.id, tphc.id) as third_party_hauler_costs_id, coalesce(tphcm.cost, tphc.cost, 0) as third_party_hauler_costs,
      js.id as job_site_id, js.address_line_1 as job_site_address_line_1, cjsh.original_id as customer_job_site_id,
      ds.id as disposal_site_id, ds.description as disposal_site_description,
      sa.id as service_area_id, sa.description as service_area_description,
      c.id as customer_id, c.name as customer_name, cg.id as customer_group_id, cg.description as customer_group_description,
      d.id as driver_id, d.description as driver_description,
      t.id as truck_id, t.description as truck_description, tt.id as truck_type_id, tt.description as truck_type_description,
      coalesce(surcharges_total.service_sum, 0) as service_surcharges, coalesce(surcharges_total.items_sum, 0) as line_items_surcharges
    from orders o
      inner join job_sites_historical jsh on jsh.id = o.job_site_id
      inner join job_sites js on js.id = jsh.original_id
      inner join customers_historical ch on ch.id = o.customer_id
      inner join customers c on c.id = ch.original_id
      inner join customer_groups cg on cg.id = c.customer_group_id
      inner join customer_job_site_historical cjsh on cjsh.id = o.customer_job_site_id
      left join (
        select *, coalesce(round((extract(epoch from
          (ww.finish_work_order_date - ww.start_work_order_date))/60/60)::numeric, 2), 0) as haul_hours
        from work_orders ww
      ) w on w.id = o.work_order_id
      left join materials_historical mh on mh.id = o.material_id
      left join materials m on m.id = mh.original_id
      left join billable_services_historical bh on bh.id = o.billable_service_id
      left join billable_services b on b.id = bh.original_id
      left join equipment_items_historical eh on eh.id = o.equipment_item_id
      left join equipment_items e on e.id = eh.original_id
      left join "3rd_party_haulers_historical" tphh on tphh.id = o.third_party_hauler_id
      left join "3rd_party_haulers" tph on tph.id = tphh.original_id
      left join drivers d on d.id = w.driver_id
      left join trucks t on t.id = w.truck_id
      left join truck_types tt on tt.id = t.truck_type_id
      left join disposal_sites_historical dsh on dsh.id = o.disposal_site_id
      left join disposal_sites ds on ds.id = dsh.original_id
      left join service_areas_historical sah on sah.id = o.service_area_id
      left join service_areas sa on sa.id = sah.original_id
      left join (
        select
          order_id,
          sum(case when billable_service_id is null then 0 else amount end) as service_sum,
          sum(case when billable_service_id is null then amount else 0 end) as items_sum
        from surcharge_item
        group by order_id
      )  surcharges_total on surcharges_total.order_id = o.id
      left join lateral (
        select sh.user_id, sh.value from sales_rep_history sh
        where sh.business_unit_id = o.business_unit_id and sh.user_id = c.sales_id and sh.created_at < o.created_at
        order by id desc
        limit 1
      ) sr on true
      left join lateral (
        select id, d.rate, d.unit || 's' as unit from disposal_site_rates_historical d
        where o.business_line_id = d.business_line_id and d.created_at < o.created_at and d.disposal_site_id = ds.id
          and m.id = d.material_id and d.event_type in ('created', 'edited')
        order by id desc
        limit 1
      ) dsr on true
      left join lateral (
        select id, tphc.cost from "3rd_party_hauler_costs_historical" tphc
        where o.business_line_id = tphc.business_line_id and tphc.created_at < o.created_at and tphc.third_party_hauler_id = tph.id
          and m.id = tphc.material_id and tphc.billable_service_id = b.id and tphc.event_type in ('created', 'edited')
        order by id desc
        limit 1
      ) tphcm on true
      left join lateral (
        select id, tphc.cost from "3rd_party_hauler_costs_historical" tphc
        where o.business_line_id = tphc.business_line_id and tphc.created_at < o.created_at and tphc.third_party_hauler_id = tph.id
          and tphc.material_id is null and tphc.billable_service_id = b.id and tphc.event_type in ('created', 'edited')
        order by id desc
        limit 1
      ) tphc on true
      left join lateral (
        select * from truck_driver_general_costs tdc
        where (tdc.business_unit_id = o.business_unit_id or tdc.business_unit_id is null)
          and to_char(tdc.date, 'YYYY-MM') = to_char(o.service_date, 'YYYY-MM')
        order by tdc.business_unit_id
        limit 1
      ) tdc on true
      left join truck_costs tc on tc.general_cost_id = tdc.id and tc.truck_id = t.id
      left join truck_types_costs ttc on ttc.general_cost_id = tdc.id and ttc.truck_type_id = tt.id
      left join driver_costs dc on dc.general_cost_id = tdc.id and dc.driver_id = d.id
      inner join (values(true),(false)) as tax_case(taxable) on true
    where o.status not in ('inProgress') and not o.draft;
    `);

export const down = migrationBuilder =>
  migrationBuilder.raw(`
    drop view profitability_items;
    create view profitability_items as
      select o.id, case when tax_case.taxable then o.grand_total else o.before_taxes_total end as grand_total,
      tax_case.taxable as with_taxes, grand_total - before_taxes_total as taxes_total,
      o.service_date, o.work_order_id, o.business_unit_id, o.billable_service_total as service_total,
      coalesce(o.billable_line_items_total + o.thresholds_total, 0) as line_items_total,
      coalesce(w.weight, 0) as disposal_weight, w.weight_unit as disposal_weight_unit, coalesce(w.haul_hours, 0) as haul_hours,
      tdc.id as truck_driver_costs_id,
      coalesce((case
        when tdc.detailed_costs
          then coalesce(tc.fuel_cost + tc.misc_average_cost + tc.insurance_cost + tc.maintenance_cost + tc.depreciation_cost,
            ttc.fuel_cost + ttc.misc_average_cost + ttc.insurance_cost + ttc.maintenance_cost + ttc.depreciation_cost,
            tdc.truck_average_cost, 0)
          else coalesce(tc.truck_average_cost, ttc.truck_average_cost, tdc.truck_average_cost, 0)
        end * w.haul_hours), 0) as truck_costs,
      coalesce((coalesce(dc.driver_average_cost, tdc.driver_average_cost, 0) * w.haul_hours), 0) as driver_costs,
      dsr.id as disposal_site_rate_id, coalesce(dsr.rate, 0) as disposal_rate, dsr.unit as disposal_unit,
      case when dsr.unit = w.weight_unit then w.weight * dsr.rate else 0 end as disposal_total,
      sr.user_id as sales_id, coalesce(sr.value, 0) as sales_rate,
      m.id as material_id, m.description as material_description,
      b.id as billable_service_id, b.description as billable_service_description,
      e.id as equipment_items_id, e.description as equipment_item_description, e.short_description as equipment_item_short_description,
      tph.id as third_party_hauler_id, tph.description as third_party_hauler_description,
      coalesce(tphcm.id, tphc.id) as third_party_hauler_costs_id, coalesce(tphcm.cost, tphc.cost, 0) as third_party_hauler_costs,
      js.id as job_site_id, js.address_line_1 as job_site_address_line_1,
      ds.id as disposal_site_id, ds.description as disposal_site_description,
      sa.id as service_area_id, sa.description as service_area_description,
      c.id as customer_id, c.name as customer_name, cg.id as customer_group_id, cg.description as customer_group_description,
      d.id as driver_id, d.description as driver_description,
      t.id as truck_id, t.description as truck_description, tt.id as truck_type_id, tt.description as truck_type_description,
      coalesce(surcharges_total.service_sum, 0) as service_surcharges, coalesce(surcharges_total.items_sum, 0) as line_items_surcharges
    from orders o
      inner join job_sites_historical jsh on jsh.id = job_site_id
      inner join job_sites js on js.id = jsh.original_id
      inner join customers_historical ch on ch.id = o.customer_id
      inner join customers c on c.id = ch.original_id
      inner join customer_groups cg on cg.id = c.customer_group_id
      left join (
        select *, coalesce(round((extract(epoch from
          (ww.finish_work_order_date - ww.start_work_order_date))/60/60)::numeric, 2), 0) as haul_hours
        from work_orders ww
      ) w on w.id = o.work_order_id
      left join materials_historical mh on mh.id = o.material_id
      left join materials m on m.id = mh.original_id
      left join billable_services_historical bh on bh.id = o.billable_service_id
      left join billable_services b on b.id = bh.original_id
      left join equipment_items_historical eh on eh.id = o.equipment_item_id
      left join equipment_items e on e.id = eh.original_id
      left join "3rd_party_haulers_historical" tphh on tphh.id = o.third_party_hauler_id
      left join "3rd_party_haulers" tph on tph.id = tphh.original_id
      left join drivers d on d.id = w.driver_id
      left join trucks t on t.id = w.truck_id
      left join truck_types tt on tt.id = t.truck_type_id
      left join disposal_sites_historical dsh on dsh.id = o.disposal_site_id
      left join disposal_sites ds on ds.id = dsh.original_id
      left join service_areas_historical sah on sah.id = o.service_area_id
      left join service_areas sa on sa.id = sah.original_id
      left join (
        select
          order_id,
          sum(case when billable_service_id is null then 0 else amount end) as service_sum,
          sum(case when billable_service_id is null then amount else 0 end) as items_sum
        from surcharge_item
        group by order_id
      )  surcharges_total on surcharges_total.order_id = o.id
      left join lateral (
        select sh.user_id, sh.value from sales_rep_history sh
        where sh.business_unit_id = o.business_unit_id and sh.user_id = c.sales_id and sh.created_at < o.created_at
        order by id desc
        limit 1
      ) sr on true
      left join lateral (
        select id, d.rate, d.unit || 's' as unit from disposal_site_rates_historical d
        where o.business_line_id = d.business_line_id and d.created_at < o.created_at and d.disposal_site_id = ds.id
          and m.id = d.material_id and d.event_type in ('created', 'edited')
        order by id desc
        limit 1
      ) dsr on true
      left join lateral (
        select id, tphc.cost from "3rd_party_hauler_costs_historical" tphc
        where o.business_line_id = tphc.business_line_id and tphc.created_at < o.created_at and tphc.third_party_hauler_id = tph.id
          and m.id = tphc.material_id and tphc.billable_service_id = b.id and tphc.event_type in ('created', 'edited')
        order by id desc
        limit 1
      ) tphcm on true
      left join lateral (
        select id, tphc.cost from "3rd_party_hauler_costs_historical" tphc
        where o.business_line_id = tphc.business_line_id and tphc.created_at < o.created_at and tphc.third_party_hauler_id = tph.id
          and tphc.material_id is null and tphc.billable_service_id = b.id and tphc.event_type in ('created', 'edited')
        order by id desc
        limit 1
      ) tphc on true
      left join lateral (
        select * from truck_driver_general_costs tdc
        where (tdc.business_unit_id = o.business_unit_id or tdc.business_unit_id is null)
          and to_char(tdc.date, 'YYYY-MM') = to_char(o.service_date, 'YYYY-MM')
        order by tdc.business_unit_id
        limit 1
      ) tdc on true
      left join truck_costs tc on tc.general_cost_id = tdc.id and tc.truck_id = t.id
      left join truck_types_costs ttc on ttc.general_cost_id = tdc.id and ttc.truck_type_id = tt.id
      left join driver_costs dc on dc.general_cost_id = tdc.id and dc.driver_id = d.id
      inner join (VALUES(true),(false)) as tax_case(taxable) on true
    where o.status not in ('inProgress') and not o.draft;
    `);
