import { Link } from 'react-router-dom';
import styled from 'styled-components';

export const MenuItemWrapper = styled(Link)`
  display: block;

  &:hover {
    background-color: var(--primary-gray-desaturated);
  }
`;
