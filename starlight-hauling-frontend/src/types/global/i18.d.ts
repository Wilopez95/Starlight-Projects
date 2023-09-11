import 'react-i18next';

declare module 'react-i18next' {
  export interface TFunction<N extends Namespace = DefaultNamespace> {
    // eslint-disable-next-line @typescript-eslint/ban-types
    <K extends TFuncKey<N> | TemplateStringsArray, I extends object = StringMap>(
      key: K | K[],
      options?: TOptions<I> | string,
    ): string;
    // eslint-disable-next-line @typescript-eslint/ban-types
    <K extends TFuncKey<N> | TemplateStringsArray, I extends object = StringMap>(
      key: K | K[],
      defaultValue?: string,
      options?: TOptions<I> | string,
    ): string;
  }
}
