import { useCallback, useMemo, useRef } from 'react';
import { type NavigationConfigItem } from '@starlightpro/shared-components';
import { startCase } from 'lodash-es';

import { RatesConfigType } from '@root/components/forms/Rates/types';
import { useBoolean, useStores } from '@root/hooks';
import { type ThresholdSettingsType } from '@root/types';

interface UserAction {
  type:
    | 'tabNavigation'
    | 'thresholdOptionChange'
    | 'thresholdSettingChange'
    | 'materialNavigation'
    | 'equipmentItemNavigation';
  item?: NavigationConfigItem<string> | ThresholdSettingsType | number;
}

type UseRatesConfirmModalResult = [
  boolean,
  boolean,
  string,
  () => void,
  () => void,
  (tab: NavigationConfigItem<RatesConfigType>) => void,
  (option?: number) => void,
  (setting?: ThresholdSettingsType) => void,
  (material?: NavigationConfigItem<string>) => void,
  (equipmentItem?: NavigationConfigItem<string>) => void,
];

export const useRatesConfirmModal = (
  dirty: boolean,
  thresholdSettingDirty: boolean,
  onTabChange: (tab: NavigationConfigItem<RatesConfigType>) => void,
  onThresholdChange: (thresholdId?: number) => void,
  onThresholdSettingChange: (setting?: ThresholdSettingsType) => void,
  onMaterialChange: (material?: NavigationConfigItem<string>) => void,
  onEquipmentItemChange: (equipmentItem?: NavigationConfigItem<string>) => void,
  initialSetting?: ThresholdSettingsType,
  currentMaterial?: NavigationConfigItem<string>,
  currentEquipmentItem?: NavigationConfigItem<string>,
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
    (tabItem: NavigationConfigItem<RatesConfigType>) => {
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
    (item?: NavigationConfigItem<string>) => {
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
    (item?: NavigationConfigItem<string>) => {
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
          onTabChange(item as NavigationConfigItem<RatesConfigType>);
          break;
        case 'thresholdOptionChange':
          onThresholdChange(item as number);
          break;
        case 'thresholdSettingChange':
          onThresholdSettingChange(item as ThresholdSettingsType);
          break;
        case 'materialNavigation':
          onMaterialChange(item as NavigationConfigItem<string>);
          break;
        case 'equipmentItemNavigation':
          onEquipmentItemChange(item as NavigationConfigItem<string>);
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
