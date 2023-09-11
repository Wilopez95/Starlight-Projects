import React, { FC } from 'react';
import i18next, { InitOptions, i18n as i18nType } from 'i18next';
import moment from 'moment';
import { merge } from 'lodash-es';
import {
  Trans as TransImport,
  TransProps,
  UseTranslationOptions,
  useTranslation as useTranslationImport,
  Namespace,
  Translation as TranslationImport,
  TranslationProps,
} from 'react-i18next';
import Backend from 'i18next-xhr-backend';
import LanguageDetector from 'i18next-browser-languagedetector';
import { en as commonEn } from './common';
import { Currency } from '../graphql/api';

export const CurrencyToSymbol = {
  [Currency.Usd]: '$',
  [Currency.Gbp]: '£',
  [Currency.Cad]: '$',
};

/**
 *
 *
 * @param options
 * @param i18nInstance if not passed, will be created a new one
 * @returns configured i18next instance
 */
export function init(options?: InitOptions, i18nInstance?: i18nType) {
  let instanceToInit = i18nInstance;

  if (!instanceToInit) {
    instanceToInit = i18next.createInstance();
  }

  //TODO: Make sure we need Backend and LanguageDetector dependencies
  instanceToInit
    .use(Backend)
    .use(LanguageDetector)
    .init(
      merge(
        {
          fallbackLng: 'en-US',
          supportedLngs: ['en-US'],
          load: 'currentOnly',
          // backend: {
          //   loadPath: '/assets/i18n/{{ns}}/{{lng}}.json',
          // },
          debug: true,
          ns: ['common'],
          defaultNS: 'common',
          keySeparator: false,

          resources: {
            'en-US': {
              common: commonEn,
            },
          },

          interpolation: {
            escapeValue: false,
            formatSeparator: ',',
            format: (value: any, format: any): any => {
              if (format === 'uppercase') {
                return value.toUpperCase();
              }

              if (value instanceof Date) {
                return moment(value).format(format);
              }

              if (format === 'currency') {
                return CurrencyToSymbol[value as Currency];
              }

              return value;
            },
          },
          react: {
            wait: true,
          },
        },
        options,
      ),
    );

  return instanceToInit;
}

export const createInstance = (options?: InitOptions) => {
  const i18n = init(options);

  const TransInstance: FC<TransProps> = (props) => <TransImport {...props} i18n={i18n} />;
  const TranslationInstance: FC<TranslationProps> = (props) => (
    <TranslationImport {...props} i18n={i18n} />
  );
  const useTranslationInstance = (ns?: Namespace, options?: UseTranslationOptions) => {
    let opts = options || {};

    opts.i18n = i18n;

    return useTranslationImport(ns, opts);
  };

  return {
    i18n,
    Trans: TransInstance,
    Translation: TranslationInstance,
    useTranslation: useTranslationInstance,
  };
};

const commonInstance = createInstance();

export const Trans = commonInstance.Trans;
export const Translation = commonInstance.Translation;
export const useTranslation = commonInstance.useTranslation;
export const i18n = commonInstance.i18n;
