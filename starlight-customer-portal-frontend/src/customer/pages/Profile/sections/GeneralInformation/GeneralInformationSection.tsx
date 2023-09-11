import React from 'react';
import { useTranslation } from 'react-i18next';
import { Layouts, Typography } from '@starlightpro/shared-components';

import { addressFormat } from '@root/core/helpers';
import { IAddress } from '@root/core/types';

interface IGeneralInformationSection {
  email: string;
  phone: string;
  billingAddress: IAddress;
  mailingAddress: IAddress;
  name?: string;
}

const fallback = '-';

const GeneralInformationSection: React.FC<IGeneralInformationSection> = ({
  name,
  email,
  phone,
  billingAddress,
  mailingAddress,
}) => {
  const { t } = useTranslation();
  const I18N_PATH = 'pages.Profile.GeneralInformationSection.';

  return (
    <>
      <Layouts.Cell area='1 / 1 / 1 / 3'>
        <Layouts.Margin bottom='2'>
          <Typography variant='bodyLarge' fontWeight='bold' shade='dark'>
            {t(`${I18N_PATH}title`)}
          </Typography>
        </Layouts.Margin>
      </Layouts.Cell>
      <Layouts.Cell area='2 / 1'>
        <Layouts.Padding top='1' bottom='1'>
          <Typography color='secondary' shade='light'>
            {t(`${I18N_PATH}name`)}
          </Typography>
        </Layouts.Padding>
      </Layouts.Cell>
      <Layouts.Cell area='2 / 2'>
        <Layouts.Padding top='1' bottom='1'>
          {name}
        </Layouts.Padding>
      </Layouts.Cell>
      <Layouts.Cell area='3 / 1'>
        <Layouts.Padding top='1' bottom='1'>
          <Typography color='secondary' shade='light'>
            {t(`${I18N_PATH}email`)}
          </Typography>
        </Layouts.Padding>
      </Layouts.Cell>
      <Layouts.Cell area='3 / 2'>
        <Layouts.Padding top='1' bottom='1'>
          {email}
        </Layouts.Padding>
      </Layouts.Cell>
      <Layouts.Cell area='4 / 1'>
        <Layouts.Padding top='1' bottom='1'>
          <Typography color='secondary' shade='light'>
            {t(`${I18N_PATH}phone`)}
          </Typography>
        </Layouts.Padding>
      </Layouts.Cell>
      <Layouts.Cell area='4 / 2'>
        <Layouts.Padding top='1' bottom='1'>
          <a href={`tel:${phone}`}>
            <Typography color='information'>{phone || fallback}</Typography>
          </a>
        </Layouts.Padding>
      </Layouts.Cell>
      <Layouts.Cell area='5 / 1'>
        <Layouts.Padding top='1' bottom='1'>
          <Typography color='secondary' shade='light'>
            {t(`${I18N_PATH}billingAddress`)}
          </Typography>
        </Layouts.Padding>
      </Layouts.Cell>
      <Layouts.Cell area='5 / 2'>
        <Layouts.Padding top='1' bottom='1'>
          {addressFormat(billingAddress)}
        </Layouts.Padding>
      </Layouts.Cell>
      <Layouts.Cell area='6 / 1'>
        <Layouts.Padding top='1' bottom='1'>
          <Typography color='secondary' shade='light'>
            {t(`${I18N_PATH}mailingAddress`)}
          </Typography>
        </Layouts.Padding>
      </Layouts.Cell>
      <Layouts.Cell area='6 / 2'>
        <Layouts.Padding top='1' bottom='1'>
          {addressFormat(mailingAddress)}
        </Layouts.Padding>
      </Layouts.Cell>
    </>
  );
};

export default GeneralInformationSection;
