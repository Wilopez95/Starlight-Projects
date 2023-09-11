import { ICompany } from '@root/types';

import { haulingHttpClient } from '../base';

const baseUrl = 'companies';

/* eslint-disable @typescript-eslint/no-extraneous-class */
export class CompanyService {
  public static getCurrentCompany() {
    return haulingHttpClient.get<void, ICompany>(`${baseUrl}/current`);
  }
}
