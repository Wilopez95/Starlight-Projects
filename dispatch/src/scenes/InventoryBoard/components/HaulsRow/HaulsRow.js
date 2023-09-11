/* eslint-disable react/prop-types */

import styled from 'styled-components';
import { device } from '@root/utils/device';

const StyledTdSmall = styled.td`
  background-color: #434343;
  color: #fff !important;
  text-align: right;
  font-weight: 700;
  border-right: 1px solid #d1d3d4;
  font-size: 69% !important;

  @media ${device.laptop} {
    background-color: #434343;
    color: #fff !important;
    text-align: right;
    font-weight: 700;
    border-right: 1px solid #d1d3d4;
    font-size: 1.3em !important;
  }
`;
const StyledStatsTd = styled.td`
  text-align: center;
  border-right: 1px solid #d1d3d4;
  font-size: 1.5em !important;
  font-weight: 700;
`;

// type Props = {
//   woDayOne: number,
//   woDayTwo: number,
//   woDayThree: number,
//   woDayFour: number,
// };

function HaulsRow(props) {
  const { woDayOne, woDayTwo, woDayThree, woDayFour } = props;

  return (
    <tr>
      <StyledTdSmall>Hauls</StyledTdSmall>
      <StyledStatsTd>{woDayOne}</StyledStatsTd>
      <StyledStatsTd>{woDayTwo}</StyledStatsTd>
      <StyledStatsTd>{woDayThree}</StyledStatsTd>
      <StyledStatsTd>{woDayFour}</StyledStatsTd>
    </tr>
  );
}
export default HaulsRow;
