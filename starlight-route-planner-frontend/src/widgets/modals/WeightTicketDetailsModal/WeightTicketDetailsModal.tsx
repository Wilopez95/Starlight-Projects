import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  Layouts,
  Navigation,
  NavigationConfigItem,
} from '@starlightpro/shared-components';
import cx from 'classnames';
import { noop } from 'lodash-es';
import { MetaSection } from '@root/common/FilePreview/FilePreviewMetaSection/FilePreviewMetaSection';
import { useStores } from '@root/hooks';
import { IWeightTicket } from '@root/types';
import { Modal } from './styles';
import { DetailsTab, MediaTab } from './tabs';
import styles from './css/styles.scss';

type TabsConfigType = 'details' | 'attachments';
const I18N_PATH_ROOT = 'Text.';

const tabs = {
  details: DetailsTab,
  attachments: MediaTab,
};

interface IProps {
  weightTickets: IWeightTicket[];
  materialIds: number[];
  initialIndex?: number;
  onClose(): void;
}

export const WeightTicketDetailsModal: React.FC<IProps> = ({
  weightTickets,
  materialIds,
  initialIndex,
  onClose,
}) => {
  const [activeIndex, setActiveIndex] = useState<number>(0);
  const { materialStore } = useStores();

  useEffect(() => {
    setActiveIndex(initialIndex ?? 0);
  }, [initialIndex]);

  const [direction, setDirection] = useState<'left' | 'right'>('left');
  const { t } = useTranslation();

  const currentWeightTicket = useMemo(() => {
    return weightTickets[activeIndex];
  }, [weightTickets, activeIndex]);

  useEffect(() => {
    materialStore.getHaulingMaterials({
      materialIds,
    });
  }, [materialStore, materialIds]);

  const filesPreviewMediaData = useMemo(() => {
    return weightTickets.map(weightTicket => {
      const mediaFile = weightTicket.media;
      let result;
      if (mediaFile.url) {
        result = {
          src: mediaFile.url,
          author: mediaFile.author,
          timestamp: mediaFile.timestamp ? new Date(+mediaFile.timestamp) : undefined,
          fileName: mediaFile.fileName ?? 'unknown',
          category: 'Media file',
        };
      }
      return result;
    });
  }, [weightTickets]);

  const currentMediaFile = useMemo(() => {
    return filesPreviewMediaData[activeIndex];
  }, [filesPreviewMediaData, activeIndex]);

  const handleNext = useCallback(() => {
    setActiveIndex(fileIndex => {
      if (fileIndex) {
        setDirection('right');

        return fileIndex + 1;
      }

      return fileIndex;
    });
  }, []);

  const handlePrev = useCallback(() => {
    setActiveIndex(fileIndex => {
      if (fileIndex) {
        setDirection('left');

        return fileIndex - 1;
      }

      return fileIndex;
    });
  }, []);

  const tabsConfig: NavigationConfigItem<TabsConfigType>[] = useMemo(() => {
    return [
      {
        label: t(`${I18N_PATH_ROOT}Details`),
        key: 'details',
        index: 0,
      },
      {
        label: t(`${I18N_PATH_ROOT}Attachments`),
        key: 'attachments',
        index: 1,
      },
    ];
  }, [t]);

  const [activeTab, setActiveTab] = useState<NavigationConfigItem<TabsConfigType>>(tabsConfig[0]);

  const handleTabChange = (tab: NavigationConfigItem<TabsConfigType>) => {
    setActiveTab(tab);
  };

  const CurrentTab = tabs[activeTab.key];

  return (
    <Modal isOpen onClose={onClose}>
      <div className={styles.modalContainer}>
        <MetaSection
          fileName={`${currentWeightTicket.ticketNumber}`}
          author={currentWeightTicket.authorName}
          src={currentMediaFile?.src}
          timestamp={new Date(+currentWeightTicket.createdAt)}
        />
        <Navigation
          activeTab={activeTab}
          configs={tabsConfig}
          onChange={handleTabChange}
          border
          withEmpty
        />
        <div
          className={cx(styles.arrow, {
            [styles.disabled]: activeIndex === 0,
          })}
          onClick={activeIndex === 0 ? noop : handlePrev}
        >
          <ArrowLeftIcon />
        </div>
        <Layouts.Margin top="3">
          <CurrentTab
            direction={direction}
            weightTicket={currentWeightTicket}
            currentMediaFile={currentMediaFile}
          />
        </Layouts.Margin>
        <div
          className={cx(styles.arrow, styles.rightArrow, {
            [styles.disabled]: activeIndex === filesPreviewMediaData.length - 1,
          })}
          onClick={activeIndex === filesPreviewMediaData.length - 1 ? noop : handleNext}
        >
          <ArrowRightIcon />
        </div>
      </div>
    </Modal>
  );
};
