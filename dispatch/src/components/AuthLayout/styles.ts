/* eslint-disable @typescript-eslint/ban-ts-comment */
import styled from 'styled-components';
// @ts-expect-error
import img from '@assets/img/login-bg.jpg';

export const LoginPage = styled.div`
  height: 100%;
  display: flex;
`;
export const Left = styled.div`
  width: 100%;
  height: 100%;
  background: url(${img}) no-repeat center / cover;
`;
export const Right = styled.div`
  width: 560px;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-flow: column;
`;
