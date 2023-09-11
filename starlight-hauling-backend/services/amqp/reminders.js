import TenantRepository from '../../repos/tenant.js';
import ReminderRepo from '../../repos/reminder.js';
import SubscriptionRepo from '../../repos/subscription/subscription.js';
import DraftSubscriptionRepo from '../../repos/subscription/draftSubscription.js';
import UserReminderRepo from '../../repos/userReminder.js';

import { createServiceToken } from '../tokens.js';
import { sendProspectReminderEmail, sendAnnualReminderEmail } from '../email.js';
import { sendProspectReminderSms, sendAnnualReminderSms } from '../sms.js';
import { getUserByEmail } from '../ums.js';
import { getCachedUser } from '../auditLog.js';

import { createChildContext } from '../../utils/koaContext.js';

import { REMINDER_TYPE } from '../../consts/reminderTypes.js';

export const generateReminders = async ctx => {
  const tenants = await TenantRepository.getInstance(ctx.state).getAll();

  let serviceToken;
  try {
    serviceToken = await createServiceToken(
      {},
      {
        audience: 'ums',
        requestId: ctx.state.reqId,
      },
    );
  } catch (error) {
    return ctx.logger.error(error, 'Failed to generate reminders. Error creating service token');
  }

  for (const tenant of tenants) {
    const childCtx = createChildContext(ctx);
    childCtx.logger.debug(`reminders->generate->tenant.name: ${tenant.name}`);

    try {
      const subscriptionRepo = SubscriptionRepo.getInstance(ctx.state, {
        schemaName: tenant.name,
      });
      const draftSubscriptionRepo = DraftSubscriptionRepo.getInstance(ctx.state, {
        schemaName: tenant.name,
      });
      const reminderRepo = ReminderRepo.getInstance(ctx.state, { schemaName: tenant.name });
      const userReminderRepo = UserReminderRepo.getInstance(ctx.state, {
        schemaName: tenant.name,
      });

      const prospectReminders = await reminderRepo.getTodayReminders({
        condition: {
          type: REMINDER_TYPE.prospectReminder,
          isProcessed: false,
        },
      });
      childCtx.logger.debug(
        `reminders->generate->hasProspectReminders: ${!!prospectReminders.length}`,
      );

      childCtx.logger.debug(prospectReminders, `reminders->generate->prospectReminders`);

      const annualReminders = await reminderRepo.getTodayReminders({
        condition: {
          type: REMINDER_TYPE.annualEventReminder,
          isProcessed: false,
        },
      });
      childCtx.logger.debug(`reminders->generate->hasAnnualReminders: ${!!annualReminders.length}`);

      childCtx.logger.debug(annualReminders, `reminders->generate->annualReminders`);

      const draftIds = prospectReminders.map(reminder => reminder.entityId);
      const subscriptionIds = annualReminders.map(reminder => reminder.entityId);

      const drafts = (await draftSubscriptionRepo.getAllByIds(draftIds)) || [];

      childCtx.logger.debug(`reminders->generate->drafts: ${JSON.stringify(drafts)}`);

      const subscriptions =
        (await subscriptionRepo.getAllByIds({
          ids: subscriptionIds,
        })) || [];

      childCtx.logger.debug(`reminders->generate->subscriptions: ${JSON.stringify(subscriptions)}`);

      const draftsMap = drafts.reduce((res, draft) => {
        res[draft.id] = draft;
        return res;
      }, {});
      const subscriptionsMap = subscriptions.reduce((res, subscription) => {
        res[subscription.id] = subscription;
        return res;
      }, {});

      const emailsSet = new Set();
      const userIdsSet = new Set();

      drafts.forEach(draft => {
        emailsSet.add(draft.csrEmail);
        userIdsSet.add(draft?.customer?.salesId);
      });
      subscriptions.forEach(subscription => {
        emailsSet.add(subscription.csrEmail);
        userIdsSet.add(subscription?.customer?.salesId);
      });

      childCtx.logger.debug('reminders->generate->get users from ums');

      let users = await Promise.all([
        ...Array.from(emailsSet)
          .filter(Boolean)
          .map(async email => {
            const csrUserInfo = await getUserByEmail(ctx, {
              serviceToken,
              email,
              resource: `srn:${tenant.name}:global:global`,
            });
            return csrUserInfo?.data?.user;
          }),
        ...Array.from(userIdsSet)
          .filter(Boolean)
          .map(userId => getCachedUser(ctx, userId)),
      ]);
      users = users.filter(Boolean);

      childCtx.logger.debug(`reminders->generate->users: ${JSON.stringify(users)}`);

      const userIdMap = users.reduce((res, user) => {
        res[user.id] = user;
        return res;
      }, {});

      const userEmailMap = users.reduce((res, user) => {
        res[user.email] = user;
        return res;
      }, {});

      childCtx.logger.debug('reminders->generate->process annual reminders');

      // eslint-disable-next-line no-loop-func
      const generateAnnualRemindersPromises = annualReminders.map(async reminder => {
        childCtx.logger.debug(`reminders->generate->annualReminder: ${JSON.stringify(reminder)}`);
        const subscription = subscriptionsMap[reminder.entityId];
        const csrUser = userEmailMap[subscription.csrEmail];
        const salesUser = userIdMap[subscription?.customer?.salesId];

        const reminderUsers = [];
        if (csrUser) {
          reminderUsers.push(csrUser);
        }
        if (salesUser && salesUser.id !== csrUser?.id) {
          reminderUsers.push(salesUser);
        }

        if (reminderUsers.length) {
          await Promise.all(
            reminderUsers.map(async user => {
              childCtx.logger.debug(
                `reminders->generate->prospectReminder->user: ${JSON.stringify(user)}`,
              );

              const phoneNumber = user?.phones?.[0]?.number;
              let informedByEmailAt = null;
              let informedBySmsAt = null;

              if (reminder.informByEmail) {
                try {
                  childCtx.logger.debug(`reminders->generate->sendEmail: ${user.email}`);
                  await sendAnnualReminderEmail(user.email, reminder.customerName, subscription.id);
                  informedByEmailAt = new Date();
                } catch (error) {
                  childCtx.logger.warn(`
                                reminders->generate->sendEmail->failer to send email
                                `);
                  childCtx.logger.error(error);
                }
              }

              if (reminder.informBySms && phoneNumber) {
                try {
                  childCtx.logger.debug(`reminders->generate->sendSms: ${phoneNumber}`);
                  await sendAnnualReminderSms(phoneNumber, reminder.customerName, subscription.id);
                  informedBySmsAt = new Date();
                } catch (error) {
                  childCtx.logger.warn(`
                                reminders->generate->sendSms->failer to send sms
                                `);
                  childCtx.logger.error(error);
                }
              }

              try {
                const data = {
                  reminderId: reminder.id,
                  userId: user.id,
                  informedByEmailAt,
                  informedBySmsAt,
                };

                childCtx.logger.debug(
                  `reminders->generate->createUserReminder: ${JSON.stringify(data)}`,
                );

                await userReminderRepo.createOne({ data });
              } catch (error) {
                childCtx.logger.warn(`
                            reminders->generate->createUserReminder->failed to create user reminder
                            `);
                childCtx.logger.error(error);
              }
            }),
          );
        }

        childCtx.logger.debug('reminders->generate->mark reminder as processed');

        await reminderRepo.updateBy({
          condition: { id: reminder.id },
          data: { isProcessed: true },
        });
      });

      childCtx.logger.debug('reminders->generate->process prospect reminders');

      const generateProspectRemindersPromises = prospectReminders.map(async reminder => {
        childCtx.logger.debug(`reminders->generate->prospectReminder: ${JSON.stringify(reminder)}`);

        const draft = draftsMap[reminder.entityId];
        if (!draft) {
          childCtx.logger.debug(`reminders->generate->draft ${reminder.entityId} not found`);
          return Promise.resolve();
        }

        const csrUser = userEmailMap[draft.csrEmail];
        const salesUser = userIdMap[draft?.customer?.salesId];

        const reminderUsers = [];
        if (csrUser) {
          reminderUsers.push(csrUser);
        }
        if (salesUser && salesUser.id !== csrUser?.id) {
          reminderUsers.push(salesUser);
        }

        if (reminderUsers.length) {
          await Promise.all(
            reminderUsers.map(async user => {
              childCtx.logger.debug(
                `reminders->generate->prospectReminder->user: ${JSON.stringify(user)}`,
              );

              const phoneNumber = user?.phones?.[0]?.number;
              let informedByEmailAt = null;
              let informedBySmsAt = null;

              if (reminder.informByEmail) {
                try {
                  childCtx.logger.debug(`reminders->generate->sendEmail: ${user.email}`);
                  await sendProspectReminderEmail(user.email, reminder.customerName, draft.id);
                  informedByEmailAt = new Date();
                } catch (error) {
                  childCtx.logger.warn(`
                                reminders->generate->sendEmail->failer to send email
                                `);
                  childCtx.logger.error(error);
                }
              }

              if (reminder.informBySms && phoneNumber) {
                try {
                  childCtx.logger.debug(`reminders->generate->sendSms: ${phoneNumber}`);
                  await sendProspectReminderSms(phoneNumber, reminder.customerName, draft.id);
                  informedBySmsAt = new Date();
                } catch (error) {
                  childCtx.logger.warn(`
                                reminders->generate->sendSms->failed to send sms
                                `);
                  childCtx.logger.error(error);
                }
              }

              try {
                const data = {
                  reminderId: reminder.id,
                  userId: user.id,
                  informedByEmailAt,
                  informedBySmsAt,
                  jobSiteId: reminder.jobSiteId,
                };

                childCtx.logger.debug(
                  `reminders->generate->createUserReminder: ${JSON.stringify(data)}`,
                );

                await userReminderRepo.createOne({ data });
              } catch (error) {
                childCtx.logger.warn(`
                            reminders->generate->createUserReminder->failed to create user reminder
                            `);
                childCtx.logger.error(error);
              }
            }),
          );
        }

        childCtx.logger.debug('reminders->generate->mark reminder as processed');

        await reminderRepo.updateBy({
          condition: { id: reminder.id },
          data: { isProcessed: true, processingTraceId: childCtx.state.reqId },
        });
        return Promise.resolve();
      });

      await Promise.all(generateAnnualRemindersPromises, generateProspectRemindersPromises);
    } catch (error) {
      childCtx.logger.error(error, `Failed to generate reminders for tenant: ${tenant.name}`);
    }
  }
  return null;
};
