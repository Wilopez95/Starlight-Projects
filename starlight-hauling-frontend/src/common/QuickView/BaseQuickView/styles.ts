import { motion } from 'framer-motion';
import styled from 'styled-components';

import { CrossIcon as CrossAsset } from '@root/assets';
import ClickOutHandler from '@root/common/ClickOutHandler/ClickOutHandler';

import { QuickViewSize } from '../types';

import { getWidth } from './helpers';

export const QuickViewContainer = styled(motion.div)<{ $size: QuickViewSize }>(p => ({
  '--quick-view-width': getWidth(p.$size, p.theme.sizes),
  '--quick-view-height': `calc(100vh - ${p.theme.sizes.headerHeight})`,
  width: 'var(--quick-view-width)',
  height: 'var(--quick-view-height)',
  maxHeight: `var(--quick-view-height)`,
  top: p.theme.sizes.headerHeight,
  position: 'fixed',
  right: 0,
  boxShadow: p.theme.shadows.quickView,
  backgroundColor: p.theme.colors.white.standard,
  zIndex: p.theme.zIndexes.overlay,
}));

export const QuickViewContentContainer = styled.div({
  width: '100%',
  height: '100%',
  position: 'absolute',
});

export const CrossIcon = styled(CrossAsset)({
  position: 'absolute',
  right: '3rem',
  top: '1rem',
  cursor: 'pointer',
  zIndex: 300,
});

export const QuickViewClickOutHandler = styled(ClickOutHandler)<{ zIndex: number }>`
  z-index: ${p => p.zIndex};
  position: relative;
`;
