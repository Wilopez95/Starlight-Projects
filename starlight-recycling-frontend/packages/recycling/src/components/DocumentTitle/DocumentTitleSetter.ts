import React, { useContext, useEffect } from 'react';
import { DocumentTitleContext } from './DocumentTitleContext';
import { useTranslation } from '../../i18n';
import { useFetchPublicCompanyInfoQuery, useGetUserInfoQuery } from '../../graphql/api';

/**
 * title - main part title string (same as pageTitle from PageTitle component)
 */
interface DocumentTitleSetterProps {
  title?: string;
  showCompanyInfo?: boolean;
  showApplicationInfo?: boolean;
}

export const DocumentTitleSetter: React.FC<DocumentTitleSetterProps> = ({
  title,
  showCompanyInfo = true,
  showApplicationInfo = true,
}) => {
  const { setDocumentTitle } = useContext(DocumentTitleContext);
  const { data: userInfoData } = useGetUserInfoQuery();
  const { data } = useFetchPublicCompanyInfoQuery({ skip: !userInfoData?.userInfo });
  const companyName1 = data?.company.companyName1;
  const [t] = useTranslation();

  useEffect(() => {
    let docTitle = title ?? '';

    if (showCompanyInfo) {
      docTitle = companyName1
        ? docTitle
          ? `${docTitle} - ${companyName1}`
          : companyName1
        : docTitle;
    }

    if (showApplicationInfo) {
      const docTitleEnd = ` - ${t('Starlight Recycling')}`;
      docTitle = docTitle + docTitleEnd;
    }

    setDocumentTitle(docTitle);
  }, [t, title, companyName1, setDocumentTitle, showApplicationInfo, showCompanyInfo]);

  return null;
};

DocumentTitleSetter.displayName = 'DocumentTitleSetter';
