import { AttachmentStore } from '../attachment/AttachmentStore';
import GlobalStore from '../GlobalStore';

export class CustomerAttachmentStore extends AttachmentStore {
  constructor(globalStore: GlobalStore) {
    super(globalStore, 'customers/media');
  }
}
