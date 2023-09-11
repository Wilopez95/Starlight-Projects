import styled from 'styled-components';

export const SpaceCell = styled.td`
  color: ${props => props.theme.colors.secondary.desaturated};
  padding: ${props => `0 ${props.theme.offsets[1]} ${props.theme.offsets[3]}`};
`;

export const InputCell = styled.td`
  padding: ${props => `0 ${props.theme.offsets[1]}`};
`;
