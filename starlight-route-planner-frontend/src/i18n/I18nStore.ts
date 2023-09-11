import { memoize } from 'lodash-es';
import { action, computed, observable } from 'mobx';

import { Languages, languages } from '@root/i18n/config/language';
import { i18nRegionLocalStorageKey, Regions, regions } from '@root/i18n/config/region';
import { getLanguageList, isAPartOfEnum } from '@root/i18n/helpers';
import { i18n } from '@root/i18n/index';
import { ILanguageConfig, IntlConfig, IRegionConfig } from '@root/i18n/types';

export class I18nStore {
  @observable lang = Languages.EN_US;

  @observable region = Regions.US;

  constructor() {
    // i18next is pulling language from local cache after browser reload
    this.setLanguage(i18n.language as Languages, true);
  }

  @action
  setLanguage(l: Languages, updateStoreOnly = false) {
    const lang = I18nStore.languageGuard(l);

    this.lang = lang;
    if (!updateStoreOnly) {
      i18n.changeLanguage(lang);
    }
  }

  @action
  setRegion(r: Regions) {
    const region = I18nStore.regionGuard(r);

    this.region = region;
    localStorage.setItem(i18nRegionLocalStorageKey, region);
  }

  @computed
  get languagesList() {
    return getLanguageList().filter(l => l.id !== this.lang);
  }

  @computed
  get intlConfig(): IntlConfig {
    return {
      ...(regions.get(this.region) as IRegionConfig),
      ...(languages.get(this.lang) as ILanguageConfig),
    };
  }

  static regionGuard(region: Regions): Regions {
    if (memoize(isAPartOfEnum)(Regions, region)) {
      return region;
    } else {
      console.warn(`[I18nStore Warning]
        County code defined by time zone is not included is region config!
        Defined region is: ${region}
        (EN region is used as fallback)`);

      return Regions.US;
    }
  }

  static languageGuard(language: Languages): Languages {
    if (memoize(isAPartOfEnum)(Languages, language)) {
      return language;
    } else {
      console.warn(`[I18nStore Warning]
        County code defined by time zone is not included is language config!
        Defined language is: ${language}
        (EN_US language is used as fallback)`);

      return Languages.EN_US;
    }
  }
}
