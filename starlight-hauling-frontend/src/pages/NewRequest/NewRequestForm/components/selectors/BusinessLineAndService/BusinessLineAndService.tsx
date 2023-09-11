import React from 'react';
import { observer } from 'mobx-react-lite';

import { Section, Subsection } from '@root/common';

import BusinessLineInfoBlock from '../../infoBlocks/BusinessLineInfoBlock/BusinessLineInfoBlock';
import ServiceAreaSelector from '../ServiceArea/ServiceArea';

import { IBusinessLineAndService } from './types';

const BusinessLineAndService: React.FC<IBusinessLineAndService> = ({
  readOnly = false,
  isCloneSubscription = false,
}) => {
  return (
    <Section>
      <Subsection gray>
        <BusinessLineInfoBlock readOnly={readOnly || isCloneSubscription} />
      </Subsection>
      <Subsection gray>
        <ServiceAreaSelector secondary readOnly={readOnly} />
      </Subsection>
    </Section>
  );
};

export default observer(BusinessLineAndService);
