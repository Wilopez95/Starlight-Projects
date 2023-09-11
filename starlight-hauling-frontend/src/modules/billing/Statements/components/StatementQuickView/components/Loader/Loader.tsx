import React from 'react';

import { SpinnerIcon } from '../../../../../../../assets';

import { LoaderWrapper } from './styles';

const Loader: React.FC = () => (
  <LoaderWrapper>
    <SpinnerIcon />
  </LoaderWrapper>
);

export default Loader;
