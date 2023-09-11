export type LocaleConfigMap<T> = {
  'en-US': T;
};

export type SupportedLocale = keyof LocaleConfigMap<unknown>;
