import { createGlobalStyle } from 'styled-components';

export const GlobalStyle = createGlobalStyle`
  * {
    padding: 0;
    margin: 0;
    outline: none;
    box-sizing: border-box;
  }
  *:focus-visible {
    outline: 2px solid var(--primary);
  }
  html,
  body,
  #app {
    width: 100%;
    height: 100%;
    font-size: 8px;
    font-family: Roboto, Helvetica, Arial, sans-serif;
    background: #f9fafb;
    overscroll-behavior: none;
  }
  a {
    text-decoration: none;
  }
  input:focus::-webkit-input-placeholder {
    color: transparent;
  }
  input:focus::-moz-placeholder {
    color: transparent;
  }
  svg {
    width: 20px;
    height: 20px;
  }
  td {
    padding: 10px;
  }
`;
