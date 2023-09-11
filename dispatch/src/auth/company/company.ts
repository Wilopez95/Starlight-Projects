/* eslint-disable @typescript-eslint/no-extraneous-class,  @typescript-eslint/no-explicit-any */
// import { haulingHttpClient } from '@root/core/api/base';
import { trashapiHttpClient } from '../api/httpClient';

const baseUrl = 'companies';

export class CompanyService {
  static currentCompany() {
    return trashapiHttpClient.get<any>(`${baseUrl}/current`);
  }
}
