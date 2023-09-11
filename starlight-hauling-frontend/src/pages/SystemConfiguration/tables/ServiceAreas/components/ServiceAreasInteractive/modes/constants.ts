export const SNAP_DISTANCE = 5;
export const DRAW_VERTEX_RADIUS = 6;

export type ModeType = 'direct_select' | 'simple_select' | 'snap_polygon' | 'readonly';

export const MODES: Record<ModeType, ModeType> = {
  direct_select: 'direct_select',
  simple_select: 'simple_select',
  snap_polygon: 'snap_polygon',
  readonly: 'readonly',
};

// TODO: use color from theme
export const LAYERS = {
  Drawing: {
    Id: 'polygon',
    QueryId: 'polygon.cold',
    ActiveId: 'polygon.hot',
    Color: '#E87900',
    Text: 'Current Service Area',
  },
  ServiceAreas: {
    Id: 'siblings-sa',
    QueryId: 'siblings-sa',
    Color: '#919EAB',
    Text: 'Other Service Areas',
  },
  AdministrativeBoundaries: {
    Id: 'administrative_us',
    QueryId: 'administrative_us',
    Color: '#006FBB',
    Text: 'Selected Boundary',
  },
};
