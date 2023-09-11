/* eslint-disable react/prop-types */
/* eslint-disable array-callback-return */

import styled from 'styled-components';
import { device } from '@root/utils/device';

// type Props = {
//   allCans: $ReadOnlyArray<Object>,
//   tallySizes: Object,
//   cansOnTrucksTally: Object,
//   totalPerSizeMapping: Object,
// };

const StyledTable = styled.table`
  table-layout: fixed;
  margin: 0 !important;
  border: none;
`;

const WhiteTr = styled.tr`
  color: #fff;
`;
const LocTdLrg = styled.td`
  font-size: 72% !important;
  width: 20%;
  @media ${device.tablet} {
    font-size: 1.1em !important;
    width: 30%;
  }
  @media ${device.laptop} {
    font-size: 1.3em !important;
    width: 30%;
  }
  @media ${device.laptopL} {
    font-size: 1.5em !important;
    width: 30%;
  }
`;

const TdLrg = styled.td`
  font-size: 66% !important;
  text-align: center;
  @media ${device.tablet} {
    font-size: 1.1rem !important;
    line-height: normal !important;
    text-align: center;
  }
  @media ${device.laptop} {
    font-size: 1.3rem !important;
    line-height: normal !important;
    text-align: center;
  }
  @media ${device.laptopL} {
    font-size: 1.5rem !important;
    line-height: normal !important;
    text-align: center;
  }
`;
const TdTrucksLrg = styled.td`
  font-size: 69% !important;
  font-weight: 700;
  @media ${device.tablet} {
    font-size: 1.2em !important;
    font-weight: 700;
    line-height: normal !important;
  }
  @media ${device.laptop} {
    font-size: 1.3em !important;
    font-weight: 700;
    line-height: normal !important;
  }
  @media ${device.laptopL} {
    font-size: 1.5em !important;
    font-weight: 700;
    line-height: normal !important;
  }
`;

const AllCansTd = styled.td`
  font-size: 1.5em !important;
  text-align: center;
  font-weight: 700;
  border-right: 1px solid #d1d3d4;
`;
const TableFooter = styled.tfoot`
  background-color: #434343;
  color: #fff;
`;

const TdTotalLrg = styled.td`
  text-align: right !important;
  font-size: 72% !important;

  @media ${device.tablet} {
    text-align: right !important;
    font-size: 1.1em !important;
    margin-right: 15px;
  }
  @media ${device.laptop} {
    text-align: right !important;
    font-size: 1.25em !important;
  }
  @media ${device.laptopL} {
    text-align: right !important;
    font-size: 1.5em !important;
  }
`;

function CanSizeByLocation(props) {
  return (
    <StyledTable className="table table-striped ">
      <thead>
        <WhiteTr>
          <LocTdLrg>LOCATION</LocTdLrg>
          {props.allCans.map((size) => (
            <TdLrg key={size}>{size}</TdLrg>
          ))}
        </WhiteTr>
      </thead>
      <tbody>
        {Object.keys(props.cansOnTrucksTally || {}).map((locationName) => (
          <tr key={locationName}>
            <TdTrucksLrg>On Trucks </TdTrucksLrg>

            {props.allCans.map((size) => (
              <AllCansTd key={size}>{props.cansOnTrucksTally[locationName][size] || 0}</AllCansTd>
            ))}
          </tr>
        ))}
        {Object.keys(props.tallySizes || {}).map((locationName) => (
          <tr key={locationName}>
            <TdTrucksLrg>{locationName}</TdTrucksLrg>
            {props.allCans.map((size) => (
              <AllCansTd key={size}>{props.tallySizes[locationName][size] || 0}</AllCansTd>
            ))}
          </tr>
        ))}
      </tbody>
      <TableFooter>
        <tr>
          <TdTotalLrg>TOTALS:</TdTotalLrg>
          {props.allCans.map((size) => (
            <AllCansTd key={size}>{props.totalPerSizeMapping[size] || 0}</AllCansTd>
          ))}
        </tr>
      </TableFooter>
    </StyledTable>
  );
}

export default CanSizeByLocation;
