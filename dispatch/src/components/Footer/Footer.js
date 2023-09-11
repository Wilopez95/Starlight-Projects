/* eslint-disable no-irregular-whitespace */
import styled from 'styled-components';

const FooterWrapper = styled.footer`
  position: fixed;
  background-color: red;
  bottom: 0px;
  left: 0px;
  right: 0px;
  margin-bottom: 0px;
  width: 100%;
  height: 40px;
  display: flex;
  bottom: 0 !important;
  left: 0;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  background-color: #fff;
  box-shadow: 0 2px 8px 0 rgba(33, 43, 54, 0.1);
`;

const CopyrightText = styled.p`
  font-size: 11px;
  margin: 0;
  padding: 0;
  text-align: center;
`;

export default function Footer() {
  return (
    <FooterWrapper>
      <CopyrightText>
        Copyright{" "}
        <span role="img" aria-label="copyright symbol">
          ©️
        </span>
        2017-
        {new Date().getFullYear()} Starlight Software Solution, LLC. All rights
        reserved{" | "}
        <a
          href="https://www.starlightsoftwaresolutions.com/privacy-policy"
          target="_blank"
          rel="noopener noreferrer"
        >
          Privacy Policy
        </a>
        {" | "}
        <a
          href="https://www.starlightsoftwaresolutions.com/terms-of-use"
          target="_blank"
          rel="noopener noreferrer"
        >
          Terms of Use
        </a>
      </CopyrightText>
    </FooterWrapper>
  );
}
