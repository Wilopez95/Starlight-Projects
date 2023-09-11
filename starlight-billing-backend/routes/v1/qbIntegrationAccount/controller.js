export const getQbIntegrationAccountsList = async ctx => {
  const { integrationId } = ctx.request.validated.query;
  const { QBAccount } = ctx.state.models;
  if (integrationId) {
    const accounts = await QBAccount.getAll(integrationId);
    ctx.body = {
      items: accounts,
    };
  } else {
    ctx.body = {};
  }
};
