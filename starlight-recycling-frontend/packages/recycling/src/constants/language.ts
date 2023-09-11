export const DEFAULT_LANGUAGE = 'en-US';
export enum Language {
  EN = 'en-US',
  UK = 'en-GB',
  FR = 'fr-CA',
}
export const LANGUAGES = [Language.EN, Language.UK, Language.FR];
export const LANGUAGE_LABEL_MAPPING = {
  [Language.EN]: 'En',
  [Language.UK]: 'Uk',
  [Language.FR]: 'Fr',
};
