import img from '@assets/img/login-bg.jpg';
import styled from 'styled-components';

import { StarlightLogo } from '@root/assets';

export const StyledForm = styled.form`
  width: 70%;
`;

export const StyledButton = styled.button`
  cursor: pointer;

  text-align: center;
  font-size: 16px;
  line-height: 44px;

  width: 100%;
  height: 44px;
  border-radius: 3px;

  color: ${(props) => props.theme.colors.white.standard};
  background-color: ${(props) => props.theme.colors.primary.standard};
  border: ${(props) => `1px solid ${props.theme.colors.primary.standard}`};

  &:hover {
    background-color: ${(props) => props.theme.colors.primary.dark};
    border: ${(props) =>
      `1px solid ${props.theme.colors.primary.dark ?? props.theme.colors.primary.standard}`};
  }

  &:focus {
    border: ${(props) =>
      `1px solid ${props.theme.colors.primary.dark ?? props.theme.colors.primary.standard}`};
  }
`;

export const CustomerPortalImage = styled('img')`
  width: 166px;
  height: 150px;
  object-fit: contain;
  background: transparent;
`;

export const Image = styled(StarlightLogo)`
  width: 56px;
  height: 16px;
`;

export const Left = styled.div`
  width: 100%;
  height: 100%;
  background: url(${img}) no-repeat center / cover;
`;
