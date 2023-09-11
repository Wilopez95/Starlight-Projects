import React from 'react';
import { Link } from 'react-router-dom';
import { Layouts } from '@starlightpro/shared-components';

import { Banner, Typography } from '@root/common';
import { Routes } from '@root/consts/routing';

import { IMaterialNotLinked } from './types';

const MaterialNotLinked: React.FC<IMaterialNotLinked> = ({ businessLineId }) => (
  <Banner>
    <Typography variant="bodyMedium">
      <Layouts.Flex>
        <span>Sorry, but this material is not linked to the selected equipment. Please,</span>
        <Link to={`/${Routes.Configuration}/${Routes.BusinessLines}/${businessLineId!}/materials`}>
          <Layouts.Padding left="0.5">
            <Typography color="information" cursor="pointer">
              select the equipment for the material
            </Typography>
          </Layouts.Padding>
        </Link>
      </Layouts.Flex>
    </Typography>
  </Banner>
);

export default MaterialNotLinked;
