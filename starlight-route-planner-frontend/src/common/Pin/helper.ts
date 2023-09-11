import { MarkerAssetType } from '../Map';

export const PIN_WIDTH = 38;
export const PIN_HEIGHT = 54;
export const DEFAULT_OUTER_STROKE_WIDTH = 2;
export const DEFAULT_INNER_STROKE_WIDTH = 1;
export const DEFAULT_INNER_STROKE_COLOR = '#212B36';
export const DEFAULT_INNER_FILL_COLOR = '#F1F1F1';
export const DEFAULT_ASSIGNED_COLOR = '#2b3949';

const pinColors: {
  [key in MarkerAssetType]: {
    innerStroke: string;
    innerFill: string;
    outerLeftFill: string;
    outerRightFill: string;
    outerStroke: string;
  };
} = {
  assigned: {
    innerStroke: DEFAULT_INNER_STROKE_COLOR,
    innerFill: DEFAULT_INNER_FILL_COLOR,
    outerLeftFill: DEFAULT_ASSIGNED_COLOR,
    outerRightFill: DEFAULT_ASSIGNED_COLOR,
    outerStroke: DEFAULT_INNER_STROKE_COLOR,
  },
  unassigned: {
    innerStroke: DEFAULT_INNER_STROKE_COLOR,
    innerFill: DEFAULT_INNER_FILL_COLOR,
    outerLeftFill: DEFAULT_INNER_FILL_COLOR,
    outerRightFill: DEFAULT_INNER_FILL_COLOR,
    outerStroke: DEFAULT_INNER_STROKE_COLOR,
  },
  'partial-assigned': {
    innerStroke: DEFAULT_INNER_STROKE_COLOR,
    innerFill: DEFAULT_INNER_FILL_COLOR,
    outerLeftFill: DEFAULT_ASSIGNED_COLOR,
    outerRightFill: DEFAULT_INNER_FILL_COLOR,
    outerStroke: DEFAULT_INNER_STROKE_COLOR,
  },
};

export const getPinColors = (
  type: MarkerAssetType,
  color: string | undefined,
  fullColor: string | undefined,
) => {
  if (color) {
    return {
      innerStroke: fullColor ?? DEFAULT_INNER_STROKE_COLOR,
      innerFill: fullColor ?? DEFAULT_INNER_FILL_COLOR,
      outerLeftFill: color,
      outerRightFill: color,
      outerStroke: DEFAULT_INNER_STROKE_COLOR,
    };
  }

  return pinColors[type];
};
