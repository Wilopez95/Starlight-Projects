import React from 'react';
import { useTranslation } from 'react-i18next';
import { Layouts, Typography } from '@starlightpro/shared-components';

interface IMainContactSection {
  name: string;
  email?: string;
  phone?: string;
}

const MainContactSection: React.FC<IMainContactSection> = ({ name, email, phone }) => {
  const { t } = useTranslation();
  const I18N_PATH = 'pages.Profile.MainContactSection.';

  const hasPhoneNumber = t('Text.__Empty') !== phone;

  return (
    <>
      <Layouts.Cell area='8 / 1 / 8 / 3'>
        <Layouts.Margin bottom='2'>
          <Typography variant='bodyLarge' fontWeight='bold' shade='dark'>
            {t(`${I18N_PATH}title`)}
          </Typography>
        </Layouts.Margin>
      </Layouts.Cell>
      <Layouts.Cell area='9 / 1'>
        <Layouts.Padding top='1' bottom='1'>
          <Typography color='secondary' shade='light'>
            {t(`${I18N_PATH}name`)}
          </Typography>
        </Layouts.Padding>
      </Layouts.Cell>
      <Layouts.Cell area='9 / 2'>
        <Layouts.Padding top='1' bottom='1'>
          {name}
        </Layouts.Padding>
      </Layouts.Cell>

      <Layouts.Cell area='10 / 1'>
        <Layouts.Padding top='1' bottom='1'>
          <Typography color='secondary' shade='light'>
            {t(`${I18N_PATH}email`)}
          </Typography>
        </Layouts.Padding>
      </Layouts.Cell>
      <Layouts.Cell area='10 / 2'>
        <Layouts.Padding top='1' bottom='1'>
          {email}
        </Layouts.Padding>
      </Layouts.Cell>
      <Layouts.Cell area='11 / 1'>
        <Layouts.Padding top='1' bottom='1'>
          <Typography color='secondary' shade='light'>
            {t(`${I18N_PATH}phone`)}
          </Typography>
        </Layouts.Padding>
      </Layouts.Cell>
      <Layouts.Cell area='11 / 2'>
        <Layouts.Padding top='1' bottom='1'>
          {hasPhoneNumber ? (
            <a href={`tel:${phone!}`}>
              <Typography color='information'>{phone}</Typography>
            </a>
          ) : (
            t('Text.__Empty')
          )}
        </Layouts.Padding>
      </Layouts.Cell>
    </>
  );
};

export default MainContactSection;
