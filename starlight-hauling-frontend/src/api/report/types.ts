import { ReportFolder } from '@root/types';

import { RequestQueryParams } from '../base';

export interface RequestReportsOptions extends RequestQueryParams {
  folder: ReportFolder;
}
