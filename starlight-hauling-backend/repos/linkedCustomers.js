import BaseRepository from './_base.js';
import CustomerRepository from './customer.js';
import BusinessUnitRepository from './businessUnit.js';

const TABLE_NAME = 'linked_customers';

class LinkedCustomersRepository extends BaseRepository {
  async getLinkedCustomers(customerId, trx = this.knex) {
    const linkedCustomers = await trx(this.tableName)
      .withSchema(this.schemaName)
      .select([
        `${CustomerRepository.TABLE_NAME}.id`,
        `${CustomerRepository.TABLE_NAME}.name`,
        `${CustomerRepository.TABLE_NAME}.businessUnitId`,
        `${BusinessUnitRepository.TABLE_NAME}.name_line_1 as businessUnitName`,
      ])
      .innerJoin(
        CustomerRepository.TABLE_NAME,
        `${CustomerRepository.TABLE_NAME}.id`,
        `${this.tableName}.linkedCustomerId`,
      )
      .innerJoin(
        BusinessUnitRepository.TABLE_NAME,
        `${BusinessUnitRepository.TABLE_NAME}.id`,
        `${CustomerRepository.TABLE_NAME}.businessUnitId`,
      )
      .where(`${this.tableName}.customerId`, customerId)
      .orderBy('id');

    return linkedCustomers || [];
  }

  async deleteRelatedDataByCustomerId(customerId, trx = this.knex) {
    await trx(this.tableName)
      .withSchema(this.schemaName)
      .where({ customerId })
      .orWhere({ linkedCustomerId: customerId })
      .del();
  }

  async linkCustomers({ customerId, linkedCustomerIds }, trx = this.knex) {
    const dataToInsert = linkedCustomerIds.reduce((result, linkedCustomerId) => {
      // Customer A should link customer B and vise versa
      result.push({ customerId, linkedCustomerId });
      result.push({ customerId: linkedCustomerId, linkedCustomerId: customerId });

      return result;
    }, []);

    await trx(this.tableName).withSchema(this.schemaName).insert(dataToInsert);
  }
}

LinkedCustomersRepository.TABLE_NAME = TABLE_NAME;

export default LinkedCustomersRepository;
