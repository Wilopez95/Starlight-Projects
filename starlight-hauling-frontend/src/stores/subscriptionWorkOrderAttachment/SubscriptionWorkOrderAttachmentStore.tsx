import { AttachmentStore } from '../attachment/AttachmentStore';
import GlobalStore from '../GlobalStore';

export class SubscriptionWorkOrderAttachmentStore extends AttachmentStore {
  constructor(globalStore: GlobalStore) {
    super(globalStore, 'subscriptions/work-orders-media');
  }
}
