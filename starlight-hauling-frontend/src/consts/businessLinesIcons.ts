import { FC, SVGProps } from 'react';

import {
  CommercialIcon,
  PortableToiletIcon,
  RecyclingIcon,
  ResidentialIcon,
  RollOffIcon,
} from '@root/assets';

import { BusinessLineType } from './businessLine';

interface IBusinessLineIcons {
  [index: string]: FC<SVGProps<HTMLOrSVGElement>>;
}

export const businessLinesIcons: IBusinessLineIcons = {
  [BusinessLineType.rollOff]: RollOffIcon,
  [BusinessLineType.commercialWaste]: CommercialIcon,
  [BusinessLineType.residentialWaste]: ResidentialIcon,
  [BusinessLineType.portableToilets]: PortableToiletIcon,
  [BusinessLineType.recycling]: RecyclingIcon,
};
