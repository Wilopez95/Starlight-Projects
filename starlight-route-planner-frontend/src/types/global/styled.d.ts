import 'styled-components';

import { ITheme } from '@starlightpro/shared-components';

declare module 'styled-components' {
  export interface DefaultTheme extends ITheme {}
}
