/* eslint-disable react/prop-types */
import { Component } from 'react';
import ReactTable from 'react-table';
import matchSorter from 'match-sorter';
import moment from 'moment';
import { Loader } from '@root/components/index';

class DriverHaulsTable extends Component {
  constructor() {
    super();
    this.state = {
      filtered: [],
    };
  }

  render() {
    const { driverData } = this.props;
    return driverData ? (
      <ReactTable
        data={driverData}
        className="-striped -highlight user-list-table"
        minRows={3}
        maxRows={3}
        filtered={this.state.filtered}
        onFilteredChange={(filtered) => this.setState({ filtered })}
        filterable
        defaultFilterMethod={(filter, row) =>
          String(row[filter.id]) === filter.value
        }
        columns={[
          {
            Header: "Driver",
            accessor: "name",
            style: { textAlign: "center", alignSelf: "center" },
            filterMethod: (filter, rows) =>
              matchSorter(rows, filter.value, { keys: ["name"] }),
            filterAll: true,
          },
          {
            Header: "Date",
            accessor: "date",
            style: { textAlign: "center", alignSelf: "center" },
          },
          {
            Header: "Start Time",
            accessor: "startTime",
            style: { textAlign: "center", alignSelf: "center" },
            Cell: (row) => (
              <span>{row.value ? moment(row.value, "LTS")._i : "_"}</span>
            ),
          },
          {
            Header: "Out",
            accessor: "stopTime",
            style: { textAlign: "center", alignSelf: "center" },
            Cell: (row) => (
              <span>{row.value ? moment(row.value, "LTS")._i : "_"}</span>
            ),
            filterMethod: (filter, rows) =>
              matchSorter(rows, filter.value, { keys: ["stopTime"] }),
          },
          {
            Header: "Adjusted Hours",
            accessor: "workTime",
            style: { textAlign: "center", alignSelf: "center" },
            filterMethod: (filter, rows) =>
              matchSorter(rows, filter.value, { keys: ["workTime"] }),
            filterAll: false,
          },
          {
            Header: "Total Hours",
            accessor: "time",
            style: { textAlign: "center", alignSelf: "center" },
            filterMethod: (filter, rows) =>
              matchSorter(rows, filter.value, { keys: ["time"] }),
            filterAll: true,
          },
          {
            Header: "TimeCards",
            accessor: "timecards",
            style: { textAlign: "center", alignSelf: "center" },
            filterMethod: (filter, rows) =>
              matchSorter(rows, filter.value, {
                keys: ["timecards"],
              }),
            filterAll: true,
          },
          {
            Header: "Incomplete Timecards",
            accessor: "incomplete",
            style: { textAlign: "center", alignSelf: "center" },
            filterMethod: (filter, rows) =>
              matchSorter(rows, filter.value, {
                keys: ["incomplete"],
              }),
            filterAll: true,
          },
          {
            Header: "Hauls",
            accessor: "woCount",
            style: { textAlign: "center", alignSelf: "center" },
            filterMethod: (filter, rows) =>
              matchSorter(rows, filter.value, {
                keys: ["woCount"],
              }),
            filterAll: true,
          },
          {
            Header: "HPH",
            accessor: "hoursPerWO",
            style: { textAlign: "center", alignSelf: "center" },
            filterMethod: (filter, rows) =>
              matchSorter(rows, filter.value, {
                keys: ["hoursPerWO"],
              }),
            filterAll: true,
          },
          {
            Header: "Miles",
            accessor: "miles",
            style: { textAlign: "center", alignSelf: "center" },
            filterMethod: (filter, rows) =>
              matchSorter(rows, filter.value, {
                keys: ["miles"],
              }),
            filterAll: true,
          },
          {
            Header: "MPH",
            accessor: "milesPerWO",
            style: { textAlign: "center", alignSelf: "center" },
            Cell: (row) => <span>{row.value === "NaN" ? "?" : row.value}</span>,
            filterMethod: (filter, rows) =>
              matchSorter(rows, filter.value, {
                keys: ["milesPerWO"],
              }),
            filterAll: true,
          },
          {
            Header: "Depart Yard",
            accessor: "preTrip",
            style: { textAlign: "center", alignSelf: "center" },
            Cell: (row) => (
              <span>{row.value === "Invalid date" ? "?" : row.value}</span>
            ),
            filterMethod: (filter, rows) =>
              matchSorter(rows, filter.value, { keys: ["preTrip"] }),
            filterAll: true,
          },
          {
            Header: "PreTrip",
            accessor: "preTripDuration",
            style: { textAlign: "center", alignSelf: "center" },
            filterMethod: (filter, rows) =>
              matchSorter(rows, filter.value, {
                keys: ["preTripDuration"],
              }),
            filterAll: true,
          },
          {
            Header: "Timecard Id",
            accessor: "timecardId",
            style: { textAlign: "center", alignSelf: "center" },
            Cell: (row) => <span>{row?.value ?? "?"}</span>,
            filterMethod: (filter, rows) =>
              matchSorter(rows, filter.value, { keys: ["timecardId"] }),
            filterAll: true,
          },
          {
            Header: "Trip Id",
            accessor: "tripId",
            style: { textAlign: "center", alignSelf: "center" },
            Cell: (row) => <span>{row?.value ?? "?"}</span>,
            filterMethod: (filter, rows) =>
              matchSorter(rows, filter.value, { keys: ["tripId"] }),
            filterAll: true,
          },
        ]}
      />
    ) : (
      <Loader />
    );
  }
}

export default DriverHaulsTable;
