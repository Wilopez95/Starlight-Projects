// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Theme, ThemeOptions } from '@material-ui/core/styles/createMuiTheme';
import React from 'react';

declare module '@material-ui/core/styles/createMuiTheme' {
  interface Theme {
    appDrawer: {
      width: React.CSSProperties['width'];
    };
    appHeader: {
      height: React.CSSProperties['height'];
    };
    sidebarMenu: {
      color?: React.CSSProperties['color'];
      iconColor?: React.CSSProperties['color'];
    };
    scale: {
      colors: [
        React.CSSProperties['color'],
        React.CSSProperties['color'],
        React.CSSProperties['color'],
        React.CSSProperties['color'],
        React.CSSProperties['color'],
      ];
    };
    labelComponent: {
      root: {
        borderRadius: React.CSSProperties['border-radius'];
        padding: React.CSSProperties['padding'];
      };
      active: {
        color: React.CSSProperties['color'];
        backgroundColor: React.CSSProperties['background-color'];
      };
      inactive: {
        color: React.CSSProperties['color'];
        backgroundColor: React.CSSProperties['background-color'];
      };
    };
    map: {
      mapStyle: string;
      defaultZoom: number;
      boundary: {
        fillColor: React.CSSProperties['color'];
        outlineColor: React.CSSProperties['color'];
        outlineWidth: number;
      };
    };
  }
  // allow configuration using `createMuiTheme`
  interface ThemeOptions {
    appDrawer?: {
      width?: React.CSSProperties['width'];
    };
    appHeader?: {
      height?: React.CSSProperties['height'];
    };
    sidebarMenu?: {
      color?: React.CSSProperties['color'];
      iconColor?: React.CSSProperties['color'];
    };
    scale?: {
      colors: [
        React.CSSProperties['color'],
        React.CSSProperties['color'],
        React.CSSProperties['color'],
        React.CSSProperties['color'],
        React.CSSProperties['color'],
      ];
    };
    labelComponent?: {
      root?: {
        borderRadius?: React.CSSProperties['border-radius'];
        padding?: React.CSSProperties['padding'];
      };
      active?: {
        color?: React.CSSProperties['color'];
        backgroundColor?: React.CSSProperties['background-color'];
      };
      inactive?: {
        color?: React.CSSProperties['color'];
        backgroundColor?: React.CSSProperties['background-color'];
      };
    };
    map?: {
      mapStyle?: string;
      defaultZoom?: number;
      boundary?: {
        fillColor?: React.CSSProperties['color'];
        outlineColor?: React.CSSProperties['color'];
        outlineWidth?: number;
      };
    };
  }
}
