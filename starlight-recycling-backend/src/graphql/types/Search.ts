import { BaseEntity } from '../../entities';
import { SearchBody } from './SearchBody';

export interface SearchOption {
  search?: SearchBody;
}

// Complete definition of the Search response
interface ShardsResponse {
  total: number;
  successful: number;
  failed: number;
  skipped: number;
}

interface Explanation {
  value: number;
  description: string;
  details: Explanation[];
}

export interface SearchResponse<T extends BaseEntity> {
  took: number;
  timed_out: boolean;
  _scroll_id?: string;
  _shards: ShardsResponse;
  hits: {
    total: {
      value: number;
    };
    max_score: number;
    hits: Array<{
      _index: string;
      _type: string;
      _id: string;
      _score: number;
      _source: T;
      _version?: number;
      _explanation?: Explanation;
      fields?: unknown;
      highlight?: unknown;
      inner_hits?: unknown;
      matched_queries?: string[];
      sort?: string[];
    }>;
  };
  aggregations?: any;
}

export interface CountResponse {
  count: number;
}
