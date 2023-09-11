import { haulingHttpClient } from '@root/core/api/base';
import {
  DomainAuthenticationStatus,
  ICompany,
  IDomain,
  IFinanceChargesSettings,
  IGeneralSettings,
  IMailSettings,
  NullableProperty,
} from '@root/core/types';

import type { CompanyInformationRequest, LogoInformationRequest } from './types';

const baseUrl = 'companies';

export class CompanyService {
  static updateCompanyInformation(companyInformation: CompanyInformationRequest) {
    return haulingHttpClient.patch<CompanyInformationRequest, ICompany>({
      url: baseUrl,
      data: companyInformation,
    });
  }

  static updateLogoInformation(logoInformation: LogoInformationRequest) {
    const { logo, ...rest } = logoInformation;

    if (logo) {
      return haulingHttpClient.sendForm<LogoInformationRequest, ICompany>({
        url: `${baseUrl}/logo`,
        data: logoInformation,
        method: 'PATCH',
      });
    }

    return haulingHttpClient.patch<LogoInformationRequest, ICompany>({
      url: `${baseUrl}/logo`,
      data: rest,
    });
  }

  static currentCompany() {
    return haulingHttpClient.get<ICompany>(`${baseUrl}/current`);
  }

  static addDomain(name: string) {
    return haulingHttpClient.post<IDomain>(`${baseUrl}/domains`, { name });
  }

  static getDomains(options?: { validatedOnly?: boolean }) {
    return haulingHttpClient.get<IDomain[]>(`${baseUrl}/domains`, options);
  }

  static deleteDomain(domainId: number) {
    return haulingHttpClient.delete(`${baseUrl}/domains/${domainId}`);
  }

  static validateDomainAuthentication(domainId: number) {
    return haulingHttpClient.post<unknown, { validationStatus: DomainAuthenticationStatus }>(
      `${baseUrl}/domains/${domainId}/validate`,
      null,
    );
  }

  static getMailSettings() {
    return haulingHttpClient.get<IMailSettings>(`${baseUrl}/mail`);
  }

  static getFinanceChargesSettings() {
    return haulingHttpClient.get<IFinanceChargesSettings>(`${baseUrl}/finance-charge`);
  }

  static getGeneralSettings() {
    return haulingHttpClient.get<IGeneralSettings>(`${baseUrl}/general`);
  }

  static updateMailSettings({
    id,
    updatedAt,
    ...mailSettings
  }: NullableProperty<IMailSettings, 'updatedAt' | 'createdAt' | 'id'>) {
    let concurrentData;

    if (id && updatedAt) {
      concurrentData = {
        [id]: updatedAt,
      };
    }

    return haulingHttpClient.put<IMailSettings>({
      url: `${baseUrl}/mail`,
      data: mailSettings,
      concurrentData,
    });
  }

  static updateFinanceChargesSettings(financeChargesSettings: IFinanceChargesSettings) {
    return haulingHttpClient.put<IFinanceChargesSettings>({
      url: `${baseUrl}/finance-charge`,
      data: financeChargesSettings,
    });
  }

  static updateGeneralSettings(generalSettings: IGeneralSettings) {
    return haulingHttpClient.put<IGeneralSettings>({
      url: `${baseUrl}/general`,
      data: generalSettings,
    });
  }
}
