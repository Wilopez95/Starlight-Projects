import { StarlightLogo } from '@starlightpro/shared-components';
import styled from 'styled-components';

export const StyledForm = styled.form`
  width: 70%;
`;

export const StyledButton = styled.button`
  cursor: pointer;
  background-color: rgb(232, 121, 0);
  border: 1px solid rgb(232, 121, 0);
  text-align: center;
  font-size: 16px;
  font-weight: 600;
  line-height: 44px;

  width: 100%;
  height: 44px;
  border-radius: 3px;
  color: white;
`;

export const Image = styled(StarlightLogo)`
  width: 166px;
  height: 55px;
  margin-bottom: 40px;
`;
