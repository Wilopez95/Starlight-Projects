import React from 'react';
import { useTranslation } from 'react-i18next';
import { Layouts } from '@starlightpro/shared-components';
import { useFormikContext } from 'formik';
import styled from 'styled-components';

import { FormInput, Typography, ValidationMessageBlock } from '@root/common';
import { pascalCase } from '@root/helpers';

import { TemplateProps, Values } from './types';

const FlexItem = styled.div`
  flex: 1;
`;

const I18N_PATH =
  'pages.SystemConfiguration.tables.CompanySettings.components.Mailing.TemplateSettings.Text.';

const TemplateSettings: React.FC<TemplateProps> = ({
  kind,
  domain,
  showDisclaimer,
  showSendCopy = true,
  disableReplyTo = false,
  variables,
}) => {
  const { values, errors, handleChange } = useFormikContext<Values>();
  const { t } = useTranslation();
  const getField = (field: string) => `${kind}${pascalCase(field)}`;

  const emptyTemplateBanner = (
    <Layouts.Margin top="2" bottom="2">
      <ValidationMessageBlock color="primary" shade="desaturated" textColor="secondary">
        {t(`${I18N_PATH}EmptyTemplate`)}
      </ValidationMessageBlock>
    </Layouts.Margin>
  );

  return (
    <>
      {emptyTemplateBanner}
      <Layouts.Box width="60%">
        <Layouts.Padding top="2" bottom="2">
          <Layouts.Grid columns="1fr 2fr">
            <>
              {domain !== undefined ? (
                <Typography as="label" htmlFor={getField('from')} color="secondary">
                  {t(`${I18N_PATH}From`)}
                </Typography>
              ) : null}
              {domain !== undefined ? (
                <Layouts.Flex direction="row">
                  <FlexItem>
                    <FormInput
                      name={getField('from')}
                      value={values[getField('from')]}
                      error={errors[getField('from')]}
                      onChange={handleChange}
                    />
                  </FlexItem>
                  <Layouts.Box width="30%">
                    <Layouts.Padding left="2" top="1">
                      <Typography color="secondary">{domain ?? ''}</Typography>
                    </Layouts.Padding>
                  </Layouts.Box>
                </Layouts.Flex>
              ) : null}
            </>
            <Typography color="secondary" as="label" htmlFor={getField('replyTo')}>
              {t(`${I18N_PATH}ReplyTo`)}
            </Typography>
            <Layouts.Flex direction="row">
              <FlexItem>
                <FormInput
                  name={getField('replyTo')}
                  value={values[getField('replyTo')]}
                  error={errors[getField('replyTo')]}
                  disabled={disableReplyTo}
                  onChange={handleChange}
                />
              </FlexItem>
              <Layouts.Box width="30%">
                <Layouts.Padding left="2" top="1">
                  <Typography color="secondary">{domain ?? ''}</Typography>
                </Layouts.Padding>
              </Layouts.Box>
            </Layouts.Flex>
            {showSendCopy ? (
              <>
                <Typography as="label" htmlFor={getField('sendCopyTo')} color="secondary">
                  {t(`${I18N_PATH}SendCopyTo`)}
                </Typography>
                <FormInput
                  name={getField('sendCopyTo')}
                  value={values[getField('sendCopyTo')]}
                  error={errors[getField('sendCopyTo')]}
                  onChange={handleChange}
                />
              </>
            ) : null}
            <Typography color="secondary" as="label" htmlFor={getField('subject')}>
              {t(`${I18N_PATH}Subject`)}
            </Typography>
            <FormInput
              name={getField('subject')}
              value={values[getField('subject')]}
              error={errors[getField('subject')]}
              onChange={handleChange}
            />
            <Typography as="label" htmlFor={getField('body')} color="secondary">
              {t(`${I18N_PATH}EmailBody`)}
            </Typography>
            <div>
              <FormInput
                area
                name={getField('body')}
                value={values[getField('body')]}
                error={errors[getField('body')]}
                onChange={handleChange}
              />
              {variables?.length ? (
                <ValidationMessageBlock color="primary" shade="desaturated" textColor="secondary">
                  {t(`${I18N_PATH}MustContainVariables`)}: <strong>{variables.join(', ')}</strong>
                </ValidationMessageBlock>
              ) : null}
            </div>
            {showDisclaimer ? (
              <>
                <Typography as="label" htmlFor={getField('disclaimerText')} color="secondary">
                  {t(`${I18N_PATH}DisclaimerText`)}
                </Typography>
                <FormInput
                  area
                  name={getField('disclaimerText')}
                  value={values[getField('disclaimerText')]}
                  error={errors[getField('disclaimerText')]}
                  onChange={handleChange}
                />
              </>
            ) : null}
          </Layouts.Grid>
        </Layouts.Padding>
      </Layouts.Box>
    </>
  );
};

export default TemplateSettings;
