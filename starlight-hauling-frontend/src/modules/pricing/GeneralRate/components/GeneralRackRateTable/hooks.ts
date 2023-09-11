import { useCallback, useMemo, useRef } from 'react';
import { type NavigationConfigItem } from '@starlightpro/shared-components';
import { startCase } from 'lodash-es';

import { useBoolean, useStores } from '@root/hooks';
import { RatesEntityType } from '@root/modules/pricing/const';
import { type ThresholdSettingsType } from '@root/types';

interface UserAction {
  type:
    | 'tabNavigation'
    | 'thresholdOptionChange'
    | 'thresholdSettingChange'
    | 'materialNavigation'
    | 'equipmentItemNavigation';
  item?: NavigationConfigItem | ThresholdSettingsType | number;
}

type UseRatesConfirmModalResult = [
  boolean,
  boolean,
  string,
  () => void,
  () => void,
  (tab: NavigationConfigItem<RatesEntityType>) => void,
  (option?: number) => void,
  (setting?: ThresholdSettingsType) => void,
  (material?: NavigationConfigItem) => void,
  (equipmentItem?: NavigationConfigItem) => void,
];

export const useRatesConfirmModal = (
  dirty: boolean,
  thresholdSettingDirty: boolean,
  onTabChange: (tab: NavigationConfigItem<RatesEntityType>) => void,
  onThresholdChange: (thresholdId?: number) => void,
  onThresholdSettingChange: (setting?: ThresholdSettingsType) => void,
  onMaterialChange: (material?: NavigationConfigItem) => void,
  onEquipmentItemChange: (equipmentItem?: NavigationConfigItem) => void,
  initialSetting?: ThresholdSettingsType,
  currentMaterial?: NavigationConfigItem,
  currentEquipmentItem?: NavigationConfigItem,
  currentThresholdOption?: number,
  currentThresholdSetting?: ThresholdSettingsType,
  // eslint-disable-next-line max-params
): UseRatesConfirmModalResult => {
  const [isChangesModalOpen, openChangesModal, closeChangesModal] = useBoolean();
  const [isSettingModalOpen, openSettingModal, closeSettingModal] = useBoolean();
  const { thresholdStore } = useStores();

  const currentThreshold = thresholdStore.getById(currentThresholdOption);

  const lastAction = useRef<UserAction>();

  const handleModalClose = useCallback(() => {
    closeChangesModal();
    closeSettingModal();
  }, [closeChangesModal, closeSettingModal]);

  const handleTabChange = useCallback(
    (tabItem: NavigationConfigItem<RatesEntityType>) => {
      lastAction.current = { type: 'tabNavigation', item: tabItem };
      if (thresholdSettingDirty) {
        openSettingModal();
      } else if (dirty) {
        openChangesModal();
      } else {
        onTabChange(tabItem);
      }
    },
    [dirty, thresholdSettingDirty, openSettingModal, openChangesModal, onTabChange],
  );

  const handleThresholdChange = useCallback(
    (option?: number) => {
      if ((dirty || thresholdSettingDirty) && option && currentThresholdOption) {
        lastAction.current = { type: 'thresholdOptionChange', item: option };
        if (thresholdSettingDirty) {
          openSettingModal();
        } else if (dirty) {
          openChangesModal();
        }
      } else {
        onThresholdChange(option);
      }
    },
    [
      currentThresholdOption,
      dirty,
      onThresholdChange,
      openChangesModal,
      openSettingModal,
      thresholdSettingDirty,
    ],
  );

  const handleThresholdSettingChange = useCallback(
    (setting?: ThresholdSettingsType) => {
      if (dirty && setting && currentThresholdSetting) {
        lastAction.current = { type: 'thresholdSettingChange', item: setting };
        openChangesModal();
      } else {
        onThresholdSettingChange(setting);
      }
    },
    [currentThresholdSetting, dirty, onThresholdSettingChange, openChangesModal],
  );

  const handleMaterialNavigation = useCallback(
    (item?: NavigationConfigItem) => {
      if (dirty && item && currentMaterial) {
        lastAction.current = { type: 'materialNavigation', item };
        openChangesModal();
      } else {
        onMaterialChange(item);
      }
    },
    [currentMaterial, dirty, onMaterialChange, openChangesModal],
  );

  const handleEquipmentItemNavigation = useCallback(
    (item?: NavigationConfigItem) => {
      if (dirty && item && currentEquipmentItem) {
        lastAction.current = { type: 'equipmentItemNavigation', item };
        openChangesModal();
      } else {
        onEquipmentItemChange(item);
      }
    },
    [currentEquipmentItem, dirty, onEquipmentItemChange, openChangesModal],
  );

  const handleModalCancel = () => {
    if (lastAction.current?.item) {
      const { type, item } = lastAction.current;

      switch (type) {
        case 'tabNavigation':
          onTabChange(item as NavigationConfigItem<RatesEntityType>);
          break;
        case 'thresholdOptionChange':
          onThresholdChange(item as number);
          break;
        case 'thresholdSettingChange':
          onThresholdSettingChange(item as ThresholdSettingsType);
          break;
        case 'materialNavigation':
          onMaterialChange(item as NavigationConfigItem);
          break;
        case 'equipmentItemNavigation':
          onEquipmentItemChange(item as NavigationConfigItem);
          break;
        default:
          return null;
      }
    }

    lastAction.current = undefined;
    closeChangesModal();
    closeSettingModal();
  };

  const modalText = useMemo(() => {
    let message = 'You have unsaved changes';
    const settingDirtyMessage = `Threshold setting for ${startCase(
      currentThreshold?.type,
    )} was changed from ${initialSetting ? startCase(initialSetting) : 'none'} to ${startCase(
      currentThresholdSetting,
    )}.`;

    if (dirty && thresholdSettingDirty) {
      message = `${message}. ${settingDirtyMessage}`;
    } else if (thresholdSettingDirty && currentThresholdOption) {
      message = settingDirtyMessage;
    }

    return message;
  }, [
    currentThreshold?.type,
    initialSetting,
    currentThresholdSetting,
    dirty,
    thresholdSettingDirty,
    currentThresholdOption,
  ]);

  return [
    isChangesModalOpen,
    isSettingModalOpen,
    modalText,
    handleModalCancel,
    handleModalClose,
    handleTabChange,
    handleThresholdChange,
    handleThresholdSettingChange,
    handleMaterialNavigation,
    handleEquipmentItemNavigation,
  ];
};
