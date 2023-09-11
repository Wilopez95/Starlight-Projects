/* eslint-disable react/prop-types */

import get from 'lodash/get';
import styled from 'styled-components';
import { device } from '@root/utils/device';

const TitleLrg = styled.td`
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
    border-bottom: 1px solid #f0f2f3 !important;
    font-size: 0.98em !important;
    width: 100% !important;
    word-wrap: none;
    font-weight: 700 !important;
    margin-left: -12%;
    margin-right: 2%;
    white-space: nowrap;
  }
`;

const TotalsTd = styled.td`
  text-align: center !important;
  border-right: 1px solid #d1d3d4 !important;
  border-bottom: 5px solid #434343 !important;
  font-size: 1.5em !important;
  font-weight: 700 !important;
`;

// type Props = {
//   totalPerSizeMapping: Object,
//   size: string,
//   tallyOnTruckSizes: Object,
//   // filtered current inventory values for today
//   currentDayOne: number,
//   // filtered current inventory values for tomorrow
//   currentDayTwo: number,
//   // filtered current inventory values for day 3
//   currentDayThree: number,
//   // filtered current inventory values for day 4
//   currentDayFour: number,
//   finalDayOne: number,
//   finalDayTwo: number,
//   finalDayThree: number,
//   finalDayFour: number,
// };

function CurrentInventoryRow(props) {
  const {
    totalPerSizeMapping,
    size,
    tallyOnTruckSizes,
    currentDayOne,
    currentDayTwo,
    currentDayThree,
    currentDayFour,
    finalDayOne,
    finalDayTwo,
    finalDayThree,
    finalDayFour,
  } = props;

  // Current inventory = - 1 for on truck and - 1 for delivery (SPOT) + 1 for final
  return (
    <tr>
      <TitleLrg>Current Inventory</TitleLrg>
      <TotalsTd>
        {get(totalPerSizeMapping, size, 0) -
          get(tallyOnTruckSizes.TRUCK, size, 0) -
          currentDayOne +
          finalDayOne}
      </TotalsTd>
      <TotalsTd>
        {get(totalPerSizeMapping, size, 0) -
          get(tallyOnTruckSizes.TRUCK, size, 0) -
          currentDayTwo +
          finalDayTwo}
      </TotalsTd>
      <TotalsTd>
        {get(totalPerSizeMapping, size, 0) -
          get(tallyOnTruckSizes.TRUCK, size, 0) -
          currentDayThree +
          finalDayThree}
      </TotalsTd>
      <TotalsTd>
        {get(totalPerSizeMapping, size, 0) -
          get(tallyOnTruckSizes.TRUCK, size, 0) -
          currentDayFour +
          finalDayFour}
      </TotalsTd>
    </tr>
  );
}

export default CurrentInventoryRow;
