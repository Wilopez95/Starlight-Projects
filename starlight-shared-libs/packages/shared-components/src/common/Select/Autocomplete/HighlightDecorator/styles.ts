import styled from 'styled-components';

export const Highlighted = styled.span`
  em {
    font-style: normal;
    font-weight: ${props => props.theme.fontWeights.bold};
  }
`;
