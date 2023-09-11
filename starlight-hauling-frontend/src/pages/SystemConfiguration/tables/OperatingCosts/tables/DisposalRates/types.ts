import { ISystemConfigurationTable } from '@root/pages/SystemConfiguration/types';

export interface IDisposalRatesTable extends ISystemConfigurationTable {
  navigationRef: React.MutableRefObject<HTMLDivElement | null>;
}
