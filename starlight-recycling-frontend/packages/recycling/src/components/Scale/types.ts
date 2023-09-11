import { ScaleConnectionStatus } from '../../graphql/api';

export interface ScaleResponseWithStatus extends PrintNodeClient.ScaleResponse {
  connectionStatus: ScaleConnectionStatus | null;
  name: string;
}
