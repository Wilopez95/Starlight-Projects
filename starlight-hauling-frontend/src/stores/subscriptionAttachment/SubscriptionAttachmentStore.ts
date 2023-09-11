import { AttachmentStore } from '../attachment/AttachmentStore';
import GlobalStore from '../GlobalStore';

export class SubscriptionAttachmentStore extends AttachmentStore {
  constructor(globalStore: GlobalStore) {
    super(globalStore, 'subscriptions/media');
  }
}
