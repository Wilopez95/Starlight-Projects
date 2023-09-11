import { IModal } from '@root/common/Modal/types';

import { IGenerationJobResult } from '../../../shared/types';

export interface IBatchStatementSummaryModal extends IModal {
  jobStatus: IGenerationJobResult | null;
  statementsTotal: number;
  loading: boolean;
}
