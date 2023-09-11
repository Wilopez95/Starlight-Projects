import { haulingHttpClient } from '../base';

import { type IClockInOut } from './types';

const baseUrl = 'clock-in-out';

export class ClockInOutService {
  static clockIn() {
    return haulingHttpClient.post<IClockInOut | undefined>(`${baseUrl}/clockin`, {});
  }

  static clockOut(id: number) {
    return haulingHttpClient.post<IClockInOut>(`${baseUrl}/clockout`, { id });
  }

  static getCurrent() {
    return haulingHttpClient.get<IClockInOut | undefined>(`${baseUrl}/current`);
  }
}
