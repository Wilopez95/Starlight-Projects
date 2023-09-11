/* eslint-disable react/prop-types */
import { compose } from 'redux';
import styled from 'styled-components';

export const FlexCol = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: stretch;
`;

const StyledCard = styled(FlexCol)`
  background: #fff;
  box-shadow: 0 2px 2px 0 rgba(0, 0, 0, 0.14), 0 1px 5px 0 rgba(0, 0, 0, 0.12),
    0 3px 1px -2px rgba(0, 0, 0, 0.2);
  position: relative;
  width: 100%;
  max-width: 100%;
  background-clip: padding-box;
  overflow: visible;
  flex: none;
  + div,
  + span {
    margin-top: 16px;
    @media (max-width: 768px) {
      margin-top: 2px;
    }
  }
  @media (max-width: 768px) {
    border-radius: 0;
    box-shadow: none;
  }
`;
const CardPure = (props) => <StyledCard {...props}>{props.children}</StyledCard>;

export const Card = compose()(CardPure);
export default Card;
