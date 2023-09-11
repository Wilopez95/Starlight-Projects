import { Link } from 'react-router-dom';
import styled from 'styled-components';

export const MenuItemWrapper = styled(Link)`
  display: block;
  margin-bottom: 16px;
  &:hover {
    background-color: var(--primary-gray-desaturated);
  }
`;

export const Wrapper = styled.div`
  width: 620px;
  background-color: var(--white);
  box-shadow: 0px 0px 1px var(--primary-gray);
  border-radius: 4px;
  padding: 24px 40px;
`;

export const RightArrow = styled.div`
  margin-top: 15px;
`;
export const MenuWrapper = styled.div`
  min-height: 50px;
  font-size: 18px;
  min-width: 400px;
  margin: 0 2px 0 2px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0 8px 8px;
  cursor: pointer;
  &:hover {
    background-color: var(--primary-gray-desaturated);
  }
`;
