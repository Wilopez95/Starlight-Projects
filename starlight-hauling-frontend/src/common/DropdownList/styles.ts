import { motion } from 'framer-motion';
import styled from 'styled-components';

export const DropdownContainer = styled(motion.div)`
  position: absolute;
  width: 100%;
  padding: 0;
  transform-origin: top;
  z-index: var(--backgroundOverlayZindex) !important;
  filter: drop-shadow(0px 8px 16px rgba(33, 43, 54, 0.1));
  top: 0;
`;
