/* eslint-disable react/prop-types */

import styled from 'styled-components';
import { device } from '@root/utils/device';
import HaulsTableBody from '@root/scenes/InventoryBoard/components/HaulsTableBody';
import TotalHaulsRow from '@root/scenes/InventoryBoard/components/TotalHaulsRow';

const THSpecial = styled.th`
  font-size: 69% !important;
  @media ${device.laptop} {
    font-size: 0.98em !important;
  }
`;
const Th = styled.th`
  background-color: #434343;
  color: #fff;
  text-align: center !important;
  font-size: 58% !important;

  @media ${device.laptop} {
    background-color: #434343;
    color: #fff;
    text-align: center !important;
    font-size: 1em !important;
    font-weight: bold
    margin-left: -12%;
    margin-right: 2%;
    white-space: no-wrap;
    }
`;
const Tr = styled.tr`
  border-right: 1px solid #434343;
`;
const TFoot = styled.tfoot`
  background-color: #434343;
  color: #fff;
`;

// type Props = {
//   workorders: $ReadOnlyArray<Object>,
//   currentInventory: $ReadOnlyArray<Object>,
//   endingInventory: $ReadOnlyArray<Object>,
//   totalPerSizeMapping: Object,
//   tallyOnTruckSizes: Object,
//   finals: $ReadOnlyArray<Object>,
//   allCans: $ReadOnlyArray<string>,
//   today: string,
//   tomorrow: string,
//   thirdDay: string,
//   fourthDay: string,
//   nextDayLabel: string,
//   lastDayLabel: string,
// };

function HaulsTable({
  workorders,
  currentInventory,
  endingInventory,
  allCans,
  totalPerSizeMapping,
  tallyOnTruckSizes,
  finals,
  nextDayLabel,
  lastDayLabel,
  today,
  tomorrow,
  thirdDay,
  fourthDay,
}) {
  // Some companies do not work on Saturday and Sunday, the hauls on these days need to be set to 0
  // And the hauls total need to be moved one more day over
  // i.e. 5280 doesn't work Sunday, hauls data needs to move over to Monday and Sunday needs to always show 0
  // i.e. On Time Disposal doesn't work on Saturday
  // ---------
  // No work on Sundays or Saturdays. Move over one more day. Force by assigning to correct day

  // create the 4 days, this is essential because if no days in trash api (people not working)
  // it will make sure data correctly assigned
  // Filtered work orders

  return (
    <table className="table ib-table">
      <thead>
        <Tr>
          <THSpecial colSpan="2">Sizes available</THSpecial>
          <Th>Today</Th>
          <Th>Tomorrow</Th>
          <Th>{nextDayLabel}</Th>
          <Th>{lastDayLabel}</Th>
        </Tr>
      </thead>
      <tbody>
        {allCans.map((size) => (
          <HaulsTableBody
            key={size}
            size={size}
            workorders={workorders}
            today={today}
            tomorrow={tomorrow}
            thirdDay={thirdDay}
            fourthDay={fourthDay}
            currentInventory={currentInventory}
            endingInventory={endingInventory}
            totalPerSizeMapping={totalPerSizeMapping}
            tallyOnTruckSizes={tallyOnTruckSizes}
            finals={finals}
          />
        ))}
      </tbody>
      <TFoot>
        <TotalHaulsRow
          workorders={workorders}
          today={today}
          tomorrow={tomorrow}
          thirdDay={thirdDay}
          fourthDay={fourthDay}
        />
      </TFoot>
    </table>
  );
}

export default HaulsTable;
