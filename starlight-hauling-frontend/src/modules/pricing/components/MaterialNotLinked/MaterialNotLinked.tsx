import React from 'react';
import { Link } from 'react-router-dom';
import { Layouts } from '@starlightpro/shared-components';

import { Banner, Typography } from '@root/common';
import { Routes } from '@root/consts/routing';

const MaterialNotLinked: React.FC<{ businessLineId: string }> = ({ businessLineId }) => (
  <Banner>
    <Layouts.Flex>
      <Typography variant="bodyMedium">
        Sorry, but this material is not linked to the selected equipment. Please,
      </Typography>
      <Link to={`/${Routes.Configuration}/${Routes.BusinessLines}/${businessLineId}/materials`}>
        <Typography
          as={Layouts.Padding}
          variant="bodyMedium"
          color="information"
          cursor="pointer"
          left="0.5"
        >
          select the equipment for the material
        </Typography>
      </Link>
    </Layouts.Flex>
  </Banner>
);

export default MaterialNotLinked;
