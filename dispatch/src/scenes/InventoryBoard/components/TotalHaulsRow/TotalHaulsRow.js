/* eslint-disable react/prop-types */

import styled from 'styled-components';
import { device } from '@root/utils/device';

const TableRow = styled.tr`
  background-color: #434343;
  color: #fff;
  text-align: center;
`;

const TableD = styled.td`
  font-size: 80%;
  @media ${device.laptop} {
    font-size: 1.5em;
  }
`;

const TotalsTd = styled.td`
  font-size: 1.5em;
`;

// type Props = {
//   today: string,
//   tomorrow: string,
//   thirdDay: string,
//   fourthDay: string,
//   workorders: $ReadOnlyArray<Object>,
// };

function TotalHaulsRow(props) {
  const filteredDay1Total =
    props.workorders && props.workorders.filter((wo) => wo.scheduledDate === props.today).length;
  const filteredDay2Total =
    props.workorders && props.workorders.filter((wo) => wo.scheduledDate === props.tomorrow).length;
  const filteredDay3Total =
    props.workorders && props.workorders.filter((wo) => wo.scheduledDate === props.thirdDay).length;
  const filteredDay4Total =
    props.workorders &&
    props.workorders.filter((wo) => wo.scheduledDate === props.fourthDay).length;

  return (
    <TableRow>
      <TableD colSpan={2}>TOTAL HAULS:</TableD>
      <TotalsTd className="align-center day-1">{filteredDay1Total}</TotalsTd>
      <TotalsTd className="align-center day-2">{filteredDay2Total}</TotalsTd>
      <TotalsTd className="align-center day-3">{filteredDay3Total}</TotalsTd>
      <TotalsTd className="align-center day-4">{filteredDay4Total}</TotalsTd>
    </TableRow>
  );
}

export default TotalHaulsRow;
