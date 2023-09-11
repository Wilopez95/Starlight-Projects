/* eslint-disable react/prop-types */

import get from 'lodash/get';
import styled from 'styled-components';
import { device } from '@root/utils/device';

const TableRow = styled.tr`
  text-align: center !important;
  border-bottom: 1px solid #f0f2f3 !important;
  border-right: 1px solid #d1d3d4 !important;
`;
const TitleSmall = styled.td`
  background-color: #434343 !important;
  color: white !important;
  text-align: right !important;
  font-weight: 14px !important;
  border-right: 1px solid #434343 !important;
  border-bottom: 1px solid #f0f2f3 !important;
  font-size: 69% !important;

  @media ${device.laptop} {
    background-color: #434343 !important;
    color: white !important;
    text-align: right !important;
    border-right: 1px solid #434343 !important;
    font-size: 0.98em !important;
    width: 100% !important;
    word-wrap: none;
    font-weight: 700 !important;
    margin-left: -5px !important;
    margin-right: 10px;
    white-space: nowrap;
  }
`;

const TotalsTd = styled.td`
  text-align: center !important;
  border-right: 1px solid #d1d3d4 !important;
  font-size: 1.5em !important;
  font-weight: 700 !important;
`;

// type Props = {
//   totalPerSizeMapping: Object,
//   size: string,
//   // filtered ending inventory values for today
//   endDayOne: number,
//   // filtered ending inventory values for tomorrow
//   endDayTwo: number,
//   // filtered ending inventory values for day 3
//   endDayThree: number,
//   // filtered ending inventory values for day 4
//   endDayFour: number,
//   finalDayOne: number,
//   finalDayTwo: number,
//   finalDayThree: number,
//   finalDayFour: number,
// };

function EndingInventoryRow(props) {
  // get table data
  const {
    size,
    totalPerSizeMapping,
    endDayOne,
    endDayTwo,
    endDayThree,
    endDayFour,
    finalDayOne,
    finalDayTwo,
    finalDayThree,
    finalDayFour,
  } = props;

  // Ending inventory = + 1 for Final and - 1 for delivery (SPOT)
  return (
    <TableRow>
      <TitleSmall>Ending Inventory</TitleSmall>
      <TotalsTd>{get(totalPerSizeMapping, size, 0) - endDayOne + finalDayOne || 0}</TotalsTd>
      <TotalsTd>{get(totalPerSizeMapping, size, 0) - endDayTwo + finalDayTwo || 0}</TotalsTd>
      <TotalsTd>{get(totalPerSizeMapping, size, 0) - endDayThree + finalDayThree || 0}</TotalsTd>
      <TotalsTd>{get(totalPerSizeMapping, size, 0) - endDayFour + finalDayFour || 0}</TotalsTd>
    </TableRow>
  );
}

export default EndingInventoryRow;
