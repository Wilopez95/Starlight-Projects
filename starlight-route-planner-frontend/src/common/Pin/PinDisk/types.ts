import { ISingleServiceMRColors } from '../types';

export type DegreesCorrectionParams = {
  index: number;
  numOfServiceDays: number;
};

export interface IPinDiskProps {
  getSectionLength: (numOfDays: number) => number;
  getDegreesCorrection: (degreesCorrectionParams: DegreesCorrectionParams) => number;
  borderWidthInDegrees: number;
  radiusOuter: number;
  radiusInner: number;
  outerCircleBorderWidth: number;
  innerCircleBorderWidth: number;
  sectionBorderWidth: number;
  circumference: number;
  innerCircleColor: string;
  unassignedColor: string;
  x: number;
  y: number;
}

export interface IPinDisk {
  pinDiskProps: IPinDiskProps;
  singleServiceMRColors: ISingleServiceMRColors[];
  width: number;
  height: number;
  cursor: boolean;
  showHighlightShadow: boolean;
}
