import knex from '../db/connection.js';

import { CHAT_STATUS } from '../consts/chatStatuses.js';
import { pricingGetOrdersCount, pricingGetSubscriptionOrdersCount } from '../services/pricing.js';
import BaseRepository from './_base.js';
import CustomerGroupRepo from './customerGroup.js';
import CustomerRepo from './customer.js';
import JobSiteRepo from './jobSite.js';
import SubscriptionRepo from './subscription/subscription.js';
import LandfillOperationRepo from './landfillOperation.js';
import ChatRepo from './chat.js';

class CommonRepository extends BaseRepository {
  static async navCounts(ctxState, { condition: { businessUnitId, email: csrEmail } } = {}) {
    const trx = await knex.transaction();

    const condition = { businessUnitId };
    let customers;
    let jobSites;
    let orders;
    let mineOrders;
    let subscriptions;
    let mineSubscriptions;
    let subscriptionOrders;
    let landfillOperations;
    let chats;

    try {
      const customerGroupIds = await CustomerGroupRepo.getInstance(ctxState).getAll(
        { fields: ['id'] },
        trx,
      );
      // added for pricing
      //ToDo:<Change it to point to Elastic Search>
      //By:<LuisAguilar> || Date: <Nov/18/2022> || TicketRelated : <NA>
      subscriptions = await SubscriptionRepo.getInstance(ctxState).count({ condition }, trx);

      [
        customers,
        jobSites,
        mineOrders,
        orders,
        mineSubscriptions,
        // pre-pricing service code:
        // subscriptions,
        // end pre-pricing service code
        subscriptionOrders,
        landfillOperations,
        chats,
      ] = await Promise.all([
        CustomerRepo.getInstance(ctxState).customersCount(
          {
            condition,
            customerGroupIds: customerGroupIds?.map(({ id }) => id),
            skipFilteredTotal: true,
          },
          trx,
        ),
        JobSiteRepo.getInstance(ctxState).jobSitesCount({ skipFilteredTotal: true }, trx),
        // pre-pricing service code:
        // OrderRepo.getInstance(ctxState).count(
        //   {
        //     condition: { businessUnitId, csrEmail },
        //     skipFilteredTotal: true,
        //   },
        //   trx,
        // ),
        // OrderRepo.getInstance(ctxState).count(
        //   {
        //     condition,
        //     skipFilteredTotal: true,
        //   },
        //   trx,
        // ),
        // end pre-pricing service code
        pricingGetOrdersCount(this.getCtx(ctxState), `?mine=true&businessUnitId=${businessUnitId}`),
        pricingGetOrdersCount(
          this.getCtx(ctxState),
          `?finalizedOnly=false&businessUnitId=${businessUnitId}`,
        ),

        //ToDo:<Change it to point to Elastic Search>
        //By:<LuisAguilar> || Date: <Nov/18/2022> || TicketRelated : <NA>

        SubscriptionRepo.getInstance(ctxState).count(
          { condition: { businessUnitId, csrEmail } },
          trx,
        ),
        // pre-pricing service code:
        // SubscriptionRepo.getInstance(ctxState).count({ condition }, trx),
        // SubscriptionOrderRepo.getInstance(ctxState).count(
        //   { condition, whereNull: 'deletedAt', omitDraft: true },
        //   trx,
        // ),
        // end pre-pricing service code

        //get Princing Subscription orders count
        pricingGetSubscriptionOrdersCount(this.getCtx(ctxState), { data: { businessUnitId } }),

        LandfillOperationRepo.getInstance(ctxState).count(
          {
            condition: { filters: { businessUnitId } },
          },
          trx,
        ),
        ChatRepo.getInstance(ctxState).count(
          { condition: { status: CHAT_STATUS.pending, businessUnitId } },
          trx,
        ),
      ]);

      await trx.commit();
    } catch (error) {
      await trx.rollback();
      throw error;
    }

    if (orders && orders?.statuses) {
      orders.statuses.finalized += orders.statuses.canceled;
      delete orders.statuses.canceled;
    }
    if (mineOrders && mineOrders?.statuses) {
      mineOrders.statuses.finalized += mineOrders.statuses.canceled;
      delete mineOrders.statuses.canceled;
    }

    return {
      customers,
      jobSites,
      orders,
      mineOrders,
      subscriptions,
      mineSubscriptions,
      subscriptionDrafts: { total: subscriptions?.statuses?.draft },
      mineSubscriptionDrafts: { total: mineSubscriptions?.statuses?.draft },
      subscriptionOrders,
      landfillOperations: { total: landfillOperations },
      chats: { total: chats },
    };
  }

  static getCtx(ctxState) {
    return {
      state: ctxState,
      logger: ctxState.logger,
    };
  }
}

export default CommonRepository;
