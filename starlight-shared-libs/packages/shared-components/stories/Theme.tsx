import React from 'react';
import { ThemeProvider } from 'styled-components';

import theme from '../src/theme/haulingTheme';

import './style.scss';
import '../src/css/base.scss';
import '../src/css/ui.scss';

export const Theme = ({ children }: any) => <ThemeProvider theme={theme}>{children}</ThemeProvider>;
