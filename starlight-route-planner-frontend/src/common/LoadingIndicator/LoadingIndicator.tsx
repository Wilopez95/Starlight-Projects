import React from 'react';
import { Layouts, Typography } from '@starlightpro/shared-components';
import { motion } from 'framer-motion';

import { CircleStyle, Container } from './styles';
import { ILoadingIndicator } from './types';

const spinTransition = {
  loop: Infinity,
  duration: 1,
  ease: 'linear',
};

export const LoadingIndicator: React.FC<ILoadingIndicator> = ({ text }) => (
  <Layouts.Flex alignItems="center" justifyContent="center" style={{ height: '100%' }}>
    <Container>
      <motion.span animate={{ rotate: 360 }} style={CircleStyle} transition={spinTransition} />
    </Container>
    {text && (
      <Layouts.Margin left="2">
        <Typography color="default" shade="dark" variant="caption" textTransform="uppercase">
          {text}
        </Typography>
      </Layouts.Margin>
    )}
  </Layouts.Flex>
);
