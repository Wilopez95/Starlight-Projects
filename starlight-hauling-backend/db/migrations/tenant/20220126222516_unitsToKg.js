import { MEASUREMENT_UNIT } from '../../../consts/units.js';

const WEIGHT_COEFF = 907.18474;
const VOLUME_COEFF = 0.764555;
const WEIGHT_COEFF_METRIC = 1000;
const LENGTH_COEFF = 0.914;

export const up = async (migrationBuilder, tenantName) => {
  const { knex } = migrationBuilder;

  const unit = await knex('companies')
    .withSchema('admin')
    .join('tenants', 'tenants.id', 'companies.tenant_id')
    .select('unit')
    .where({ name: tenantName })
    .first();
  if (unit === MEASUREMENT_UNIT.us) {
    await migrationBuilder.raw(`
      update work_orders
      set weight = case when weight_unit = 'tons' then round(weight * ${WEIGHT_COEFF}, 2) 
        when weight_unit = 'yards' then round(weight * ${VOLUME_COEFF}, 2) else null end
      where weight is not null;
      
      update work_orders_historical
      set weight = case when weight_unit = 'tons' then round(weight * ${WEIGHT_COEFF}, 2) 
        when weight_unit = 'yards' then round(weight * ${VOLUME_COEFF}, 2) else null end
      where weight is not null;
      
      update landfill_operations
      set net_weight = case when net_weight is not null then round(net_weight * ${WEIGHT_COEFF_METRIC}, 2) else null end, 
        weight_in = case when weight_in is not null then round(weight_in * ${WEIGHT_COEFF_METRIC}, 2) else null end,
        weight_out = case when weight_out is not null then round(weight_out * ${WEIGHT_COEFF_METRIC}, 2) else null end;
        
      update landfill_operations_historical
      set net_weight = case when net_weight is not null then round(net_weight * ${WEIGHT_COEFF_METRIC}, 2) else null end, 
        weight_in = case when weight_in is not null then round(weight_in * ${WEIGHT_COEFF_METRIC}, 2) else null end,
        weight_out = case when weight_out is not null then round(weight_out * ${WEIGHT_COEFF_METRIC}, 2) else null end;  
      
      update manifest_items
      set quantity = case when unit_type = 'tons' then round(quantity * ${WEIGHT_COEFF}, 2) 
        when unit_type = 'yards' then round(quantity * ${VOLUME_COEFF}, 2) else 0 end;
        
      update manifest_items_historical
      set quantity = case when unit_type = 'tons' then round(quantity * ${WEIGHT_COEFF}, 2) 
        when unit_type = 'yards' then round(quantity * ${VOLUME_COEFF}, 2) else 0 end;  
        
      update global_rates_thresholds
        set "limit" = round("limit" * ${WEIGHT_COEFF}, 2)
      where "limit" is not null and exists (select 1 from thresholds where id = threshold_id and type = 'overweight' and unit = 'ton');
      
      update global_rates_thresholds_historical
        set "limit" = round("limit" * ${WEIGHT_COEFF}, 2)
      where "limit" is not null and exists (select 1 from thresholds where id = threshold_id and type = 'overweight' and unit = 'ton');    
        
      update custom_rates_group_thresholds
        set "limit" = round("limit" * ${WEIGHT_COEFF}, 2)
      where "limit" is not null and exists (select 1 from thresholds where id = threshold_id and type = 'overweight' and unit = 'ton');
      
      update custom_rates_group_thresholds_historical
        set "limit" = round("limit" * ${WEIGHT_COEFF}, 2)
      where "limit" is not null and exists (select 1 from thresholds where id = threshold_id and type = 'overweight' and unit = 'ton');
      
      update equipment_items
      set size = round(size * ${VOLUME_COEFF}, 2), empty_weight = round(empty_weight * ${WEIGHT_COEFF}, 2), 
        length = round(length * ${LENGTH_COEFF}, 2), width =round(width * ${LENGTH_COEFF}, 2), 
        height=round(width * ${LENGTH_COEFF}, 2);
        
      update equipment_items_historical
      set size = round(size * ${VOLUME_COEFF}, 2), empty_weight = round(empty_weight * ${WEIGHT_COEFF}, 2), 
        length = round(length * ${LENGTH_COEFF}, 2), width =round(width * ${LENGTH_COEFF}, 2), 
        height=round(width * ${LENGTH_COEFF}, 2);      
  `);
  }
};

export const down = async (migrationBuilder, tenantName) => {
  const { knex } = migrationBuilder;

  const unit = await knex('companies')
    .withSchema('admin')
    .join('tenants', 'tenants.id', 'companies.tenant_id')
    .select('unit')
    .where({ name: tenantName })
    .first();
  if (unit === MEASUREMENT_UNIT.us) {
    await migrationBuilder.raw(`
      update work_orders
      set weight = case when weight_unit = 'tons' then round(weight / ${WEIGHT_COEFF}, 2) 
        when weight_unit = 'yards' then round(weight / ${VOLUME_COEFF}, 2) else null end
      where weight is not null;
      
      update work_orders_historical
      set weight = case when weight_unit = 'tons' then round(weight / ${WEIGHT_COEFF}, 2) 
        when weight_unit = 'yards' then round(weight / ${VOLUME_COEFF}, 2) else null end
      where weight is not null;
      
      update landfill_operations
      set net_weight = case when net_weight is not null then round(net_weight / ${WEIGHT_COEFF_METRIC}, 2) else null end, 
        weight_in = case when weight_in is not null then round(weight_in / ${WEIGHT_COEFF_METRIC}, 2) else null end,
        weight_out = case when weight_out is not null then round(weight_out / ${WEIGHT_COEFF_METRIC}, 2) else null end;
        
      update landfill_operations_historical
      set net_weight = case when net_weight is not null then round(net_weight / ${WEIGHT_COEFF_METRIC}, 2) else null end, 
        weight_in = case when weight_in is not null then round(weight_in / ${WEIGHT_COEFF_METRIC}, 2) else null end,
        weight_out = case when weight_out is not null then round(weight_out / ${WEIGHT_COEFF_METRIC}, 2) else null end;  
      
      update manifest_items
      set quantity = case when unit_type = 'tons' then round(quantity / ${WEIGHT_COEFF}, 2) 
        when unit_type = 'yards' then round(quantity / ${VOLUME_COEFF}, 2) else 0 end;
        
      update manifest_items_historical
      set quantity = case when unit_type = 'tons' then round(quantity / ${WEIGHT_COEFF}, 2) 
        when unit_type = 'yards' then round(quantity / ${VOLUME_COEFF}, 2) else 0 end;  
        
      update custom_rates_group_thresholds
        set "limit" = round("limit" / ${WEIGHT_COEFF}, 2)
      where "limit" is not null and exists (select 1 from thresholds where id = threshold_id and type = 'overweight' and unit = 'ton');
      
      update custom_rates_group_thresholds_historical
        set "limit" = round("limit" / ${WEIGHT_COEFF}, 2)
      where "limit" is not null and exists (select 1 from thresholds where id = threshold_id and type = 'overweight' and unit = 'ton');
      
      update global_rates_thresholds
        set "limit" = round("limit" / ${WEIGHT_COEFF}, 2)
      where "limit" is not null and exists (select 1 from thresholds where id = threshold_id and type = 'overweight' and unit = 'ton');
      
      update global_rates_thresholds_historical
        set "limit" = round("limit" / ${WEIGHT_COEFF}, 2)
      where "limit" is not null and exists (select 1 from thresholds where id = threshold_id and type = 'overweight' and unit = 'ton');
      
      update equipment_items
        set size = round(size / ${VOLUME_COEFF}, 2), empty_weight = round(empty_weight / ${WEIGHT_COEFF}, 2), 
      length = round(length / ${LENGTH_COEFF}, 2), width = round(width / ${LENGTH_COEFF}, 2), 
      height = round(width / ${LENGTH_COEFF}, 2);
      
      update equipment_items_historical
        set size = round(size / ${VOLUME_COEFF}, 2), empty_weight = round(empty_weight / ${WEIGHT_COEFF}, 2), 
      length = round(length / ${LENGTH_COEFF}, 2), width = round(width / ${LENGTH_COEFF}, 2), 
      height = round(width / ${LENGTH_COEFF}, 2);          
  `);
  }
};
