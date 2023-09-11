/* eslint-disable react/prop-types */

import { memo } from 'react';
import styled from 'styled-components';

import HaulsRow from '@root/scenes/InventoryBoard/components/HaulsRow';
import EndingInventoryRow from '@root/scenes/InventoryBoard/components/EndingInventoryRow';
import CurrentInventoryRow from '@root/scenes/InventoryBoard/components/CurrentInventoryRow';

const TableD = styled.td`
  background-color: #434343;
  color: white !important;
  text-align-vertical: right;
  width: 80%;
  text-align: center !important;
  font-size: 2rem !important;
  font-weight: bold;
`;

// type Props = {
//   size: Object,
//   workorders: $ReadOnlyArray<Object>,
//   currentInventory: $ReadOnlyArray<Object>,
//   endingInventory: $ReadOnlyArray<Object>,
//   tallyOnTruckSizes: Object,
//   totalPerSizeMapping: Object,
//   finals: $ReadOnlyArray<Object>,
//   today: string,
//   tomorrow: string,
//   thirdDay: string,
//   fourthDay: string,
// };

function HaulsTableBody(props) {
  const {
    size,
    workorders,
    currentInventory,
    endingInventory,
    tallyOnTruckSizes,
    totalPerSizeMapping,
    finals,
    today,
    tomorrow,
    thirdDay,
    fourthDay,
  } = props;

  const filteredHaulsWo = workorders && workorders.filter((wo) => wo.size === size);
  const filteredEndingWo = endingInventory && endingInventory.filter((wo) => wo.size === size);
  const filteredCurrentWo = currentInventory && currentInventory.filter((wo) => wo.size === size);
  const filteredFinalWo = finals && finals.filter((wo) => wo.size === size);
  return (
    <>
      <tr style={{ height: 0 }}>
        <TableD rowSpan={4}>{size}</TableD>
      </tr>
      <HaulsRow
        woDayOne={
          filteredHaulsWo ? filteredHaulsWo.filter((wo) => wo.scheduledDate === today).length : null
        }
        woDayTwo={
          filteredHaulsWo
            ? filteredHaulsWo.filter((wo) => wo.scheduledDate === tomorrow).length
            : null
        }
        woDayThree={
          filteredHaulsWo
            ? filteredHaulsWo.filter((wo) => wo.scheduledDate === thirdDay).length
            : null
        }
        woDayFour={
          filteredHaulsWo
            ? filteredHaulsWo.filter((wo) => wo.scheduledDate === fourthDay).length
            : null
        }
      />
      <EndingInventoryRow
        size={size}
        totalPerSizeMapping={totalPerSizeMapping}
        endDayOne={
          filteredEndingWo
            ? filteredEndingWo.filter((wo) => wo.scheduledDate === today).length
            : null
        }
        endDayTwo={
          filteredEndingWo
            ? filteredEndingWo.filter((wo) => wo.scheduledDate === tomorrow).length
            : null
        }
        endDayThree={
          filteredEndingWo
            ? filteredEndingWo.filter((wo) => wo.scheduledDate === thirdDay).length
            : null
        }
        endDayFour={
          filteredEndingWo
            ? filteredEndingWo.filter((wo) => wo.scheduledDate === fourthDay).length
            : null
        }
        finalDayOne={
          filteredFinalWo ? filteredFinalWo.filter((wo) => wo.scheduledDate === today).length : null
        }
        finalDayTwo={
          filteredFinalWo
            ? filteredFinalWo.filter((wo) => wo.scheduledDate === tomorrow).length
            : null
        }
        finalDayThree={
          filteredFinalWo
            ? filteredFinalWo.filter((wo) => wo.scheduledDate === thirdDay).length
            : null
        }
        finalDayFour={
          filteredFinalWo
            ? filteredFinalWo.filter((wo) => wo.scheduledDate === fourthDay).length
            : null
        }
      />

      <CurrentInventoryRow
        size={size}
        totalPerSizeMapping={totalPerSizeMapping}
        tallyOnTruckSizes={tallyOnTruckSizes}
        currentDayOne={
          filteredCurrentWo
            ? filteredCurrentWo.filter((wo) => wo.scheduledDate === props.today).length
            : null
        }
        currentDayTwo={
          filteredCurrentWo
            ? filteredCurrentWo.filter((wo) => wo.scheduledDate === props.tomorrow).length
            : null
        }
        currentDayThree={
          filteredCurrentWo
            ? filteredCurrentWo.filter((wo) => wo.scheduledDate === props.thirdDay).length
            : null
        }
        currentDayFour={
          filteredCurrentWo
            ? filteredCurrentWo.filter((wo) => wo.scheduledDate === props.fourthDay).length
            : null
        }
        finalDayOne={
          filteredFinalWo ? filteredFinalWo.filter((wo) => wo.scheduledDate === today).length : null
        }
        finalDayTwo={
          filteredFinalWo
            ? filteredFinalWo.filter((wo) => wo.scheduledDate === tomorrow).length
            : null
        }
        finalDayThree={
          filteredFinalWo
            ? filteredFinalWo.filter((wo) => wo.scheduledDate === thirdDay).length
            : null
        }
        finalDayFour={
          filteredFinalWo
            ? filteredFinalWo.filter((wo) => wo.scheduledDate === fourthDay).length
            : null
        }
      />
    </>
  );
}

export default memo(HaulsTableBody);
