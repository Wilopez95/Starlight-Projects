import { action, observable } from 'mobx';

export class SystemConfigurationStore {
  @observable showInactive = true;
  @observable isCreating = false;
  @observable isPreDuplicating = false;
  @observable isDuplicating = false;

  @action toggleShow(value?: boolean) {
    if (value !== undefined) {
      this.showInactive = value;

      return;
    }
    this.showInactive = !this.showInactive;
  }

  @action toggleCreating(value?: boolean) {
    if (value !== undefined) {
      this.isCreating = value;

      return;
    }
    this.isCreating = !this.isCreating;
  }

  @action togglePreDuplicating(value?: boolean) {
    if (value !== undefined) {
      this.isPreDuplicating = value;

      return;
    }
    this.isPreDuplicating = !this.isPreDuplicating;
  }

  @action toggleDuplicating(value?: boolean) {
    if (value !== undefined) {
      this.isDuplicating = value;

      return;
    }
    this.isDuplicating = !this.isDuplicating;
  }
}
