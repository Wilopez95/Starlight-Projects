import type {
  companyAdditionalInfo,
  FileWithPreview,
  ICompany,
  LogoInformation,
} from '@root/core/types';

export type LogoInformationRequest = Omit<LogoInformation, 'logoUrl'> & {
  logo: FileWithPreview | null;
  logoUrl: string | null | undefined;
  id: number;
  updatedAt: Date;
};

export type CompanyInformationRequest = Omit<ICompany, companyAdditionalInfo>;
