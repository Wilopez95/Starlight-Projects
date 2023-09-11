import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Layouts, Typography } from '@starlightpro/shared-components';

import { Divider } from '@root/common/TableTools';

import { Modal } from './styles';

const I18N_PATH = 'Text.';

interface IProps {
  title: string;
  validationMessage: string;
  onClose(): void;
}

export const RouteValidationModalBase: React.FC<IProps> = ({
  children,
  title,
  validationMessage,
  onClose,
}) => {
  const { t } = useTranslation();

  return (
    <Modal isOpen>
      <Layouts.Padding top="4" bottom="4" left="5" right="5">
        <Typography color="default" as="label" shade="standard" variant="headerThree">
          {title}
        </Typography>
        <Layouts.Margin top="2">
          <Typography color="default" as="label" shade="standard" variant="bodyMedium">
            {validationMessage}
          </Typography>
        </Layouts.Margin>
        {children}
      </Layouts.Padding>
      <Divider />
      <Layouts.Padding top="3" bottom="3" left="5" right="5">
        <Layouts.Flex justifyContent="flex-end">
          <Button variant="primary" onClick={onClose}>
            {t(`${I18N_PATH}Ok`)}
          </Button>
        </Layouts.Flex>
      </Layouts.Padding>
    </Modal>
  );
};
