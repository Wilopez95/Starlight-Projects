import React, { useMemo } from 'react';

import { IPinDisk } from './types';

export const PinDisk: React.FC<IPinDisk> = ({
  width,
  height,
  cursor,
  showHighlightShadow,
  pinDiskProps: {
    getSectionLength,
    getDegreesCorrection,
    radiusOuter,
    radiusInner,
    outerCircleBorderWidth,
    innerCircleBorderWidth,
    circumference,
    innerCircleColor,
    unassignedColor,
    x,
    y,
  },
  singleServiceMRColors,
}) => {
  const innerCircleRadius = radiusInner || 9;
  const numOfServiceDays = singleServiceMRColors.length;
  const sectionLength = getSectionLength(numOfServiceDays);

  const serviceDaysColors = useMemo(
    () =>
      singleServiceMRColors.reduce(
        (allColors: JSX.Element[], { color = unassignedColor }, index) => {
          const degrees = getDegreesCorrection({ index, numOfServiceDays });

          const currentColorSection = (
            <circle
              key={index}
              r={innerCircleRadius}
              cx={x}
              cy={y}
              fill="transparent"
              stroke={color}
              strokeWidth={radiusOuter}
              strokeDasharray={`${sectionLength} ${circumference}`}
              transform={`rotate(${degrees} ${x} ${y})`}
            />
          );

          allColors.push(currentColorSection);

          return allColors;
        },
        [],
      ),
    [
      circumference,
      getDegreesCorrection,
      innerCircleRadius,
      numOfServiceDays,
      radiusOuter,
      sectionLength,
      singleServiceMRColors,
      unassignedColor,
      x,
      y,
    ],
  );

  return (
    <svg
      style={{ width, height, cursor: cursor ? 'pointer' : 'default' }}
      viewBox="0 0 38 57"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {showHighlightShadow && <ellipse cx="19" cy="53" rx="9" ry="4" fill="#637381" />}
      <g id="pin &#226;&#128;&#147; segmented">
        <path
          id="Shape"
          fillRule="evenodd"
          clipRule="evenodd"
          d="M0 18.9C0 8.4645 8.50929 0 19 0C29.4907 0 38 8.4645 38 18.9C38 33.075 19 54 19 54C19 54 0 33.075 0 18.9ZM12.3242 19.2115C12.3242 22.9375 15.3149 25.9615 18.9999 25.9615C22.6849 25.9615 25.6756 22.9375 25.6756 19.2115C25.6756 15.4855 22.6849 12.4615 18.9999 12.4615C15.3149 12.4615 12.3242 15.4855 12.3242 19.2115Z"
          fill="#212B36"
        />
        {singleServiceMRColors.length && (
          <>
            <circle
              r={radiusOuter}
              cx={x}
              cy={y}
              fill="black"
              stroke="black"
              strokeWidth={outerCircleBorderWidth}
            />
            <circle r={radiusOuter} cx={x} cy={y} fill="transparent" />
            {serviceDaysColors}
            <circle
              r={innerCircleRadius}
              cx={x}
              cy={y}
              fill={innerCircleColor}
              stroke="black"
              strokeWidth={innerCircleBorderWidth}
            />
          </>
        )}
      </g>
    </svg>
  );
};
