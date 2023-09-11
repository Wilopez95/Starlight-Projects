import { haulingHttpClient } from '../base';

import { IClockInOut } from './types';

const baseUrl = 'clock-in-out';

/* eslint-disable @typescript-eslint/no-extraneous-class */
export class ClockInOutService {
  static clockIn() {
    return haulingHttpClient.post<unknown, IClockInOut | undefined>(`${baseUrl}/clockin`, {});
  }

  static clockOut(id: number) {
    return haulingHttpClient.post<Pick<IClockInOut, 'id'>, IClockInOut>(`${baseUrl}/clockout`, {
      id,
    });
  }

  public static getCurrentClockInOut() {
    return haulingHttpClient.get<void, IClockInOut>(`${baseUrl}/current`);
  }
}
