import React from 'react';
import { Layouts, Typography } from '@starlightpro/shared-components';
import { motion } from 'framer-motion';

import { LoaderDoubleIcon } from './styles';

export const PublishingIndicator: React.FC<{
  text: string;
  desaturated?: boolean;
}> = ({ text, desaturated }) => {
  return (
    <Layouts.Flex direction="row" alignItems="center">
      <motion.svg
        animate={{
          rotate: [180, 0],
        }}
        transition={{
          duration: 0.8,
          times: [0, 1],
          loop: Infinity,
          repeatDelay: 1,
        }}
      >
        <LoaderDoubleIcon desaturated={desaturated} />
      </motion.svg>
      <Typography
        variant="bodySmall"
        color={desaturated ? 'secondary' : 'default'}
        shade={desaturated ? 'desaturated' : 'dark'}
      >
        {text}
      </Typography>
    </Layouts.Flex>
  );
};
