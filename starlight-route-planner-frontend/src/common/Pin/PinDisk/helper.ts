import { PinColorEnum } from '@root/types';

import { IPinDiskProps } from './types';

export class PinDiskProps implements IPinDiskProps {
  cachedSectionLength: Map<number, number> = new Map();
  cachedRotateSection: Map<number, number> = new Map();
  borderWidthInDegrees: number;
  radiusOuter: number;
  radiusInner: number;
  sectionBorderWidth: number;
  outerCircleBorderWidth: number;
  innerCircleBorderWidth: number;
  circumference: number;
  innerCircleColor = PinColorEnum.innerCircle;
  unassignedColor = PinColorEnum.unassigned;
  x: number;
  y: number;

  constructor() {
    this.radiusOuter = 17;
    this.radiusInner = 9;
    this.outerCircleBorderWidth = 0;
    this.innerCircleBorderWidth = 1;
    this.sectionBorderWidth = 1;
    this.circumference = Math.PI * this.radiusInner * 2;
    this.borderWidthInDegrees = Math.ceil(
      (this.sectionBorderWidth / 2) * (360 / this.circumference),
    );
    this.x = 19;
    this.y = 19;
  }

  getSectionLength = (numOfDays: number) => {
    const res = this.cachedSectionLength.get(numOfDays);

    if (!res) {
      const sectionLength = this.circumference / numOfDays - this.sectionBorderWidth;

      this.cachedSectionLength.set(numOfDays, sectionLength);

      return sectionLength;
    }

    return res;
  };

  getDegreesToRotate = (numOfDays: number) => {
    const res = this.cachedRotateSection.get(numOfDays);

    if (!res) {
      const rotateDegrees = 360 / numOfDays;

      this.cachedRotateSection.set(numOfDays, rotateDegrees);

      return rotateDegrees;
    }

    return res;
  };

  // border width value is in 'px' and could vary, so we need to convert this to degrees
  getDegreesCorrection = ({
    index,
    numOfServiceDays,
  }: {
    index: number;
    numOfServiceDays: number;
  }) => {
    const degreesCorrection =
      this.getDegreesToRotate(numOfServiceDays) * index + this.borderWidthInDegrees / 2 - 90;

    return degreesCorrection;
  };
}
