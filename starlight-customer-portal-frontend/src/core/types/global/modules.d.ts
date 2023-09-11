declare module '@assets*.svg' {
  const content: React.FC<React.SVGProps<HTMLOrSVGElement>>;
  export default content;
}

declare module '@assets*.jpg' {
  const content: string;
  export default content;
}

declare module 'react-day-picker/lib/src/classNames' {
  const classes: import('react-day-picker').ClassNames;

  export default classes;
}

declare module '@mapbox/mapbox-gl-draw' {
  import { Feature, FeatureCollection, Geometry } from 'geojson';
  import { IControl } from 'mapbox-gl';

  namespace MapboxDraw {
    export interface IMapboxDrawControls {
      point?: boolean;
      line_string?: boolean;
      polygon?: boolean;
      trash?: boolean;
      combine_features?: boolean;
      uncombine_features?: boolean;
    }
  }

  interface IMapboxDrawModes {
    simple_select: function;
    direct_select: function;
    draw_point: function;
    draw_polygon: function;
    draw_line_string: function;
  }

  class MapboxDraw implements IControl {
    getDefaultPosition: () => string;

    static modes: IMapboxDrawModes;

    constructor(options?: {
      displayControlsDefault?: boolean;
      keybindings?: boolean;
      touchEnabled?: boolean;
      boxSelect?: boolean;
      clickBuffer?: number;
      touchBuffer?: number;
      controls?: IMapboxDrawControls;
      styles?: Record<string, unknown>[];
      modes?: Record<string, function>;
      defaultMode?: string;
      userProperties?: boolean;
    });

    public add(geojson: Feature | FeatureCollection | Geometry): string[];

    public get(featureId: string): Feature | undefined;

    public getFeatureIdsAt(point: { x: number; y: number }): string[];

    public getSelectedIds(): string[];

    public getSelected(): FeatureCollection;

    public getSelectedPoints(): FeatureCollection;

    public getAll(): FeatureCollection;

    public delete(ids: string | string[]): this;

    public deleteAll(): this;

    public set(featureCollection: FeatureCollection): string[];

    public trash(): this;

    public combineFeatures(): this;

    public uncombineFeatures(): this;

    public getMode(): string;

    public changeMode(mode: string, options?: Record<string, unknown>): this;

    public setFeatureProperty(featureId: string, property: string, value: any): this;

    onAdd(map: mapboxgl.Map): HTMLElement;

    onRemove(map: mapboxgl.Map): any;
  }

  export default MapboxDraw;
}

declare module '@turf/nearest-point-on-line' {
  import { Feature, Coord, Units } from '@turf/helpers';

  export interface NearestPointOnLine extends Feature<Point> {
    properties: {
      index?: number;
      dist?: number;
      location?: number;
      [key: string]: any;
    };
  }

  function nearestPointOnLine<G extends LineString | MultiLineString>(
    lines: Feature<G> | G,
    pt: Coord,
    options: { units?: Units } = {},
  ): NearestPointOnLine;

  export default nearestPointOnLine;
}

declare class ExagoApi {
  constructor(options: {
    WebEndpoint: string;
    ApiKey: string;
    ShowErrorDetail?: boolean;
    OnLoad(): void;
    OnError?(err: { Message: string }): void;
    OnDisposeContainer?(container: HTMLElement): void;
  });

  public async ExecuteStaticReport(
    exportType: React.ReactNode,
    reportPath: string,
    udfOrOptions: any,
    successCallback: (data: any) => void,
    errorCallback?: (err: string) => void,
  ): void;

  public async ExecuteReport(
    container: React.ReactNode,
    exportType: 'html' | 'pdf' | 'csv' | 'excel' | 'rtf' | 'json',
    reportPath: string,
    options?: unknown,
  ): void;

  public async EditReport(container: React.ReactNode, reportPath: string): void;
  public async NewReport(container: React.ReactNode, reportType: string): void;
  public async LoadFullUI(container: React.ReactNode): void;

  public async DisposeContainerContent(container: React.ReactNode): Promise;
  public async DisposePage(): Promise;
}
