import React, { FC, useState, useCallback, useEffect } from 'react';
import SidePanel, { SidePanelProps } from '../SidePanel';
import { makeStyles } from '@material-ui/core/styles';

interface SidePanelsProps {}

export interface OpenSidePanel {
  /**
   * Add content to stack
   * */
  stacked?: boolean;
  content: React.ReactNode;
  anchor?: 'left' | 'right';
  onClose?: () => Promise<any>;
  container?: React.ReactInstance | (() => React.ReactInstance | null) | null;
}

export const useContainedStyles = makeStyles(
  () =>
    ({
      root: {
        '& > .MuiBackdrop-root': {
          backgroundColor: 'rgba(0, 0, 0, 0.3)',
        },
        '& > .MuiPaper-root': {
          position: 'absolute',
        },
      },
    } as any),
);

let currentOpenCallback: (options: OpenSidePanel) => void = () => {};
let currentCloseCallback = () => {};

export const openSidePanel = (options: OpenSidePanel) => currentOpenCallback(options);
export const closeSidePanel = () => currentCloseCallback();

export const SidePanels: FC<SidePanelsProps> = () => {
  const [sidePanels, setSidePanels] = useState<SidePanelProps[]>([]);
  const containedClasses = useContainedStyles();
  const closePanel = useCallback(async () => {
    if (sidePanels.length === 0) {
      return;
    }

    const newSidePanels = sidePanels.slice();
    const sidePanel = newSidePanels.pop();
    const clearSidePanel = () => {
      setSidePanels(newSidePanels);
    };

    if (sidePanel?.isOpen && sidePanel?.onClose) {
      const onClose = sidePanel?.onClose;

      const promise = onClose();

      try {
        await promise;

        clearSidePanel();

        return true;
      } catch {
        return false;
      }
    }

    clearSidePanel();
  }, [sidePanels]);
  const openPanel = useCallback(
    ({ stacked, content, anchor, onClose, container }: OpenSidePanel) => {
      setSidePanels((sidePanels) => {
        const newElement = {
          isOpen: !!content,
          content,
          container,
          anchor,
          classes: containedClasses,
          onClose: onClose,
        };

        if (stacked) {
          return [...sidePanels, newElement];
        }

        return [newElement];
      });
    },
    [containedClasses],
  );

  useEffect(() => {
    currentOpenCallback = openPanel;
    currentCloseCallback = closePanel;
  }, [openPanel, closePanel]);

  return (
    <>
      {sidePanels.map((sidePanel, index) => {
        const content = sidePanel.content;
        const container = sidePanel.container;
        const classes = sidePanel.classes;
        const anchor = sidePanel.anchor || 'right';

        return (
          <SidePanel
            key={index}
            isOpen={sidePanel.isOpen}
            onClose={closePanel}
            content={content}
            container={container}
            classes={classes}
            anchor={anchor}
          />
        );
      })}
    </>
  );
};

export default SidePanels;
