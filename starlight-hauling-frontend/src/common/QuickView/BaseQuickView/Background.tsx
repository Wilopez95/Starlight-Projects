import { motion } from 'framer-motion';
import styled from 'styled-components';

export const Background = styled(motion.div)<{ zIndex: number }>`
  position: absolute;
  height: calc(100vh - ${p => p.theme.sizes.headerHeight});
  width: 100vw;
  left: 0;
  top: ${p => p.theme.sizes.headerHeight};
  background-color: ${p => p.theme.colors.default.standard};
  z-index: ${p => p.zIndex};
  cursor: pointer;
`;
