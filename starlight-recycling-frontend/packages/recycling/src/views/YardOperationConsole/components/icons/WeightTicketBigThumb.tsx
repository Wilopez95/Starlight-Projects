import * as React from 'react';
import { FC } from 'react';

export const WeightTicketBigThumb: FC = (props) => {
  return (
    <svg width="80" height="80" viewBox="0 0 80 80" fill="none" {...props}>
      <rect
        x="0.5"
        y="0.5"
        width="79"
        height="79"
        rx="1.5"
        fill="url(#pattern0)"
        stroke="#C5C5C5"
      />
      <defs>
        <pattern id="pattern0" patternContentUnits="objectBoundingBox" width="1" height="1">
          <use xlinkHref="#image0" transform="translate(0 -0.811475) scale(0.0163934)" />
        </pattern>
        <image
          id="image0"
          width="61"
          height="160"
          xlinkHref="data:image/png;base64,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"
        />
      </defs>
    </svg>
  );
};

export default WeightTicketBigThumb;
