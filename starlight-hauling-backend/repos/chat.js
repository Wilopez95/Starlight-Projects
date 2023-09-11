import { ITEMS_PER_PAGE } from '../consts/limits.js';
import { CHAT_STATUS } from '../consts/chatStatuses.js';
import BaseRepository from './_base.js';
import ContractorRepository from './contractor.js';
import CustomerRepository from './customer.js';
import ContactRepository from './contact.js';

const TABLE_NAME = 'chats';
const mainChatFields = ['id', 'status', 'lastReplier', 'lastMessage', 'lastMsgTimestamp'];

class ChatRepository extends BaseRepository {
  async getAllPaginated({ condition = {}, skip = 0, limit = ITEMS_PER_PAGE }, trx = this.knex) {
    const { participantId, businessUnitId, isContractor = false, mine = false } = condition;
    const customerTableName = CustomerRepository.TABLE_NAME;
    const contractorTableName = ContractorRepository.TABLE_NAME;
    const contactTableName = ContactRepository.TABLE_NAME;

    const chatFields = mainChatFields.map(field => `${this.tableName}.${field}`);
    const customerFields = [`${customerTableName}.name as customerName`];
    const contactFields = [
      trx.raw(
        `concat(${contactTableName}.first_name, ' ',  ${contactTableName}.last_name) as "contactName"`,
      ),
    ];

    let query = trx(this.tableName)
      .withSchema(this.schemaName)
      .select([...chatFields, ...customerFields, ...contactFields])
      .select(
        trx.raw(
          `case when ${this.tableName}.last_replier is null 
                and ${this.tableName}.status = '${CHAT_STATUS.pending}' then false 
                when ${this.tableName}.read_by @> ? then true 
                else false end as "read"`,
          [[participantId]],
        ),
      )
      .innerJoin(
        `${contractorTableName}`,
        `${contractorTableName}.id`,
        `${this.tableName}.contractorId`,
      )
      .innerJoin(
        `${customerTableName}`,
        `${customerTableName}.id`,
        `${contractorTableName}.customerId`,
      )
      .leftJoin(`${contactTableName}`, `${contactTableName}.id`, `${contractorTableName}.contactId`)
      .where(`${this.tableName}.businessUnitId`, businessUnitId);
    if (isContractor) {
      query = query.where({ contractorId: participantId });
    } else if (!isContractor && mine) {
      query = query.whereRaw(`${this.tableName}.user_ids @> ?`, [[participantId]]);
    }
    const result = await query.limit(limit).offset(skip);
    return result;
  }

  resolve(ids) {
    return super.updateBy({
      whereIn: [{ key: 'id', values: ids }],
      data: { status: CHAT_STATUS.resolved },
    });
  }
}

ChatRepository.TABLE_NAME = TABLE_NAME;

export default ChatRepository;
