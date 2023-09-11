import styled from 'styled-components';

import { QuickViewLeftPanelSize } from '../types';

interface IQuickViewContentGrid {
  actions: boolean;
  leftPanelSize?: QuickViewLeftPanelSize;
}

const actionsArea = '"actions actions actions actions"';

export const QuickViewContentGrid = styled.div<IQuickViewContentGrid>(p => {
  let panelsArea = '';

  switch (p.leftPanelSize) {
    case 'half':
      panelsArea = '"leftPanel leftPanel rightPanel rightPanel"';
      break;

    case 'one-third': {
      panelsArea = '"leftPanel rightPanel rightPanel rightPanel"';
      break;
    }

    default: {
      panelsArea = '"rightPanel rightPanel rightPanel rightPanel"';
    }
  }

  return {
    display: 'grid',
    width: 'var(--quick-view-width)',
    height: 'var(--quick-view-height)',
    maxHeight: `var(--quick-view-height)`,
    gridTemplateAreas: p.actions ? `${panelsArea} ${actionsArea}` : panelsArea,
    gridTemplateRows: p.actions ? 'minmax(0,1fr) auto' : '1fr',
    gridTemplateColumns: p.leftPanelSize ? 'minmax(0,1fr) 1fr 1fr 1fr' : '1fr 1fr 1fr 1fr',
    fontSize: '1.75rem',
  };
});

export const QuickViewLeftPanel = styled.section(p => ({
  gridArea: 'leftPanel',
  backgroundColor: p.theme.colors.grey.desaturated,
}));

export const QuickViewRightPanel = styled.section({
  gridArea: 'rightPanel',
  display: 'flex',
  flexDirection: 'column',
});
export const QuickViewActionsPanel = styled.section(p => ({
  gridArea: 'actions',
  borderTop: '1px solid rgba(33,43,54,.1)',
  backgroundColor: p.theme.colors.white.standard,
  padding: '3rem',
}));
