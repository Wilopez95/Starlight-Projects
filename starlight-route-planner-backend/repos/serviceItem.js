// @ts-check

export default class ServiceItemRepository {
  constructor(trx, schemaName) {
    this.trx = trx;
    this.schemaName = schemaName;
    this.tableName = 'service_items';
  }

  async updateServiceDaysOfWeekDay(serviceItemId, currentDay, newDay) {
    const result = await this.trx.raw(`
            UPDATE ${this.schemaName}.${this.tableName}
            SET service_days_of_week = service_days_of_week - '${currentDay}' || jsonb_build_object('${newDay}', service_days_of_week->'${currentDay}')
            WHERE id = ${serviceItemId}
        `);

    return result;
  }

  async updateServiceDaysOfWeekRoute(serviceItemId, currentDay, newRouteName) {
    const result = await this.trx.raw(`
            UPDATE ${this.schemaName}.${this.tableName}
            SET service_days_of_week = jsonb_set(service_days_of_week, '{${currentDay},route}', '"${newRouteName}"')
            WHERE id = ${serviceItemId}
        `);

    return result;
  }
}
