import SubscriptionServiceItemRepo from '../../repos/subscriptionServiceItem/subscriptionServiceItem.js';

export const getAllServiceItemsStream = async (ctx, options) => {
  const stream = await SubscriptionServiceItemRepo.getInstance(ctx.state).getAllStream(options);
  // pre-pricing servie code:
  // export const getAllServiceItemsStream = (ctx, options) => {
  //   const stream = SubscriptionServiceItemRepo.getInstance(ctx.state).getAllStream(options);
  // stream.once('error', err => {
  //   ctx.logger.error(err, 'Getting service items failed, stream error');
  //   stream.push(null);
  // });

  // stream.once('close', err => {
  //   ctx.logger.error(err, 'Getting service items failed, stream close');
  //   stream.push(null);
  // });

  // return stream.pipe(getTransformRawServiceItemsStream());
  return stream;
};
