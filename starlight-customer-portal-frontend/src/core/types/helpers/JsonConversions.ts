import { GeoJSON } from 'geojson';

type Primitive = number | boolean | symbol | string | null | undefined | bigint;
type ConvertDate<T> = T extends Date ? Exclude<T, Date> | string : T;

type MapObject<T> = T extends Array<infer E>
  ? Array<JsonConversions<E>>
  : T extends GeoJSON
  ? T
  : JsonConversions<Exclude<T, Primitive>> | Extract<T, Primitive>;

type ConvertDateFields<T> = {
  [K in keyof T]: ConvertDate<T[K]>;
};

type DeepMap<T> = {
  [K in keyof T]: MapObject<T[K]>;
};

// We need to map over type T twice to make it inferrable:
// first, with `ConvertDateFields` and then with `DeepMap` to recurse down.
export type JsonConversions<T> = T extends Array<infer E>
  ? Array<JsonConversions<E>>
  : DeepMap<ConvertDateFields<T>>;
