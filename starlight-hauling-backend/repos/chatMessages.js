import ApiError from '../errors/ApiError.js';
import { CHAT_STATUS } from '../consts/chatStatuses.js';
import { ITEMS_PER_PAGE } from '../consts/limits.js';
import BaseRepository from './_base.js';
import ChatRepo from './chat.js';
import ContactsRepo from './contact.js';
import ContractorRepo from './contractor.js';

const TABLE_NAME = 'chat_messages';

class ChatMessagesRepository extends BaseRepository {
  constructor(ctxState, { schemaName }) {
    super(ctxState, { schemaName, tableName: TABLE_NAME });
  }

  async createMessage({
    data,
    user,
    connectedUsers = [],
    isContractor = false,
    chatId = null,
  } = {}) {
    const { id: userId, userId: contractorId, contactId = null } = user;
    let { name: authorName } = user;

    const trx = await this.knex.transaction();

    const chatRepo = ChatRepo.getInstance(this.ctxState);
    const getChatCondition = isContractor
      ? { contractorId, status: CHAT_STATUS.pending }
      : { id: chatId };

    try {
      if (isContractor) {
        const { firstName, lastName } = await ContactsRepo.getInstance(this.ctxState).getBy(
          {
            condition: { id: contactId },
            fields: ['firstName', 'lastName'],
          },
          trx,
        );
        authorName = `${firstName || ''} ${lastName || ''}`;
      }

      let chat = await chatRepo.getBy(
        {
          condition: getChatCondition,
          fields: ['id', 'userIds', 'status'],
        },
        trx,
      );

      if (chat && chat.status === CHAT_STATUS.resolved) {
        return ApiError.invalidRequest(`Chat is resolved`);
      }

      let msgData;
      let chatData;
      let chatCondition;
      if (isContractor) {
        if (!chat) {
          const contractor = await ContractorRepo.getInstance(this.ctxState).getById(
            { id: contractorId, fields: ['businessUnitId'] },
            trx,
          );
          chat = await chatRepo.createOne(
            {
              data: {
                contractorId,
                lastMessage: data.message,
                businessUnitId: contractor.businessUnitId,
              },
              fields: ['id', 'userIds'],
            },
            trx,
          );
        }
        msgData = {
          ...data,
          authorName,
          contractorId,
          chatId: chat.id,
        };
        chatCondition = { id: chat.id };
        chatData = { lastMessage: data.message };
      } else {
        msgData = {
          ...data,
          userId,
          chatId,
          authorName,
        };
        const userIds = chat.userIds ? [...new Set([...chat.userIds, userId])] : [userId];
        chatCondition = { id: chatId };
        chatData = { lastMessage: data.message, lastReplier: authorName, userIds };
      }
      const [message] = await Promise.all([
        this.createOne({ data: msgData }, trx),
        chatRepo.updateBy(
          {
            condition: chatCondition,
            data: { ...chatData, readBy: connectedUsers, lastMsgTimestamp: new Date() },
          },
          trx,
        ),
      ]);

      await trx.commit();
      return message;
    } catch (error) {
      await trx.rollback();
      throw error;
    }
  }

  getAllPaginatedForContractor(
    { condition = {}, fields = ['*'], skip = 0, limit = ITEMS_PER_PAGE },
    trx = this.knex,
  ) {
    const { contractorId } = condition;
    const mappedFields = fields.map(field => `${this.tableName}.${field}`);
    return trx(this.tableName)
      .withSchema(this.schemaName)
      .select(mappedFields)
      .innerJoin(`${ChatRepo.TABLE_NAME}`, `${ChatRepo.TABLE_NAME}.id`, `${this.tableName}.chatId`)
      .where(`${ChatRepo.TABLE_NAME}.contractorId`, contractorId)
      .andWhere(`${ChatRepo.TABLE_NAME}.status`, CHAT_STATUS.pending)
      .orderBy(`${this.tableName}.id`, 'DESC')
      .limit(limit)
      .offset(skip);
  }

  async getAllPaginatedForCsr({
    condition = {},
    csrId,
    fields = ['*'],
    skip = 0,
    limit = ITEMS_PER_PAGE,
  }) {
    const { chatId } = condition;
    const trx = await this.knex.transaction();
    const chatRepo = ChatRepo.getInstance(this.ctxState);

    try {
      const chat = await chatRepo.getById({ id: chatId, fields: ['readBy'] }, trx);
      if (chat) {
        await chatRepo.updateBy(
          {
            condition: { id: chatId },
            data: { readBy: [...new Set([...chat.readBy, csrId])] },
          },
          trx,
        );
      }
      const messages = await super.getAllPaginated({
        condition,
        fields,
        skip,
        limit,
        orderBy: [{ column: `${this.tableName}.id`, order: 'desc' }],
      });
      await trx.commit();
      return messages;
    } catch (error) {
      await trx.rollback();
      throw error;
    }
  }
}

ChatMessagesRepository.TABLE_NAME = TABLE_NAME;

export default ChatMessagesRepository;
