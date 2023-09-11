import { queries } from '@testing-library/dom';
import { Queries, QueryMethod, RenderOptions, waitForOptions } from '@testing-library/react';

import GlobalStore from '@root/stores/GlobalStore';

export interface ICustomRenderOptions<Q extends Queries = typeof queries> extends RenderOptions<Q> {
  globalStore?: GlobalStore;
}

export type CustomQueries = typeof queries & {
  getByName: QueryMethod<[string], HTMLElement>;
  queryByName: QueryMethod<[string], HTMLElement | null>;
  getAllByName: QueryMethod<[string], HTMLElement[]>;
  findAllByName: QueryMethod<[string, undefined, waitForOptions], Promise<HTMLElement[]>>;
  findByName: QueryMethod<[string, undefined, waitForOptions], Promise<HTMLElement>>;
};
