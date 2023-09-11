import { shallow, mount } from 'enzyme';
import WorkOrderHistoryNote from './WorkOrderHistoryNote';

const timezone = 'America/Denver';
const notesStates = {
  NOTE: 'NOTE',
  MANIFEST: 'MANIFEST',
  SCALETICKET: 'SCALETICKET',
  TRANSITION: 'TRANSITION',
};
const data = {
  location: {
    id: null,
    name: null,
    description: null,
    type: null,
    waypointType: null,
    waypointName: null,
    location: {
      lon: null,
      lat: null,
    },
    createdBy: null,
    createdDate: null,
    modifiedBy: null,
    modifiedDate: null,
  },
  can: {
    id: null,
    name: null,
    serial: null,
    size: null,
    requiresMaintenance: null,
    outOfService: null,
    source: null,
    startDate: null,
    hazardous: null,
    action: null,
    timestamp: null,
    createdBy: null,
    createdDate: null,
    modifiedBy: null,
    modifiedDate: null,
  },
  id: 2056967,
  workOrderId: 200486,
  type: 'TRANSITION',
  note: {
    text: 'Reassigned from Bert Rodriguez Rt13 to Manuel Berlin Rt 24',
    driverId: 65,
    newState: 'REASSIGNMENT',
  },
  createdBy: 'alycia.hilzer@5280waste.com',
  createdDate: '2019-08-26T00:53:45.680Z',
  modifiedBy: null,
  modifiedDate: '2019-08-26T00:53:45.680Z',
  deleted: 0,
};
const dataNote = {
  location: {
    id: null,
    name: null,
    description: null,
    type: null,
    waypointType: null,
    waypointName: null,
    location: {
      lon: null,
      lat: null,
    },
    createdBy: null,
    createdDate: null,
    modifiedBy: null,
    modifiedDate: null,
  },
  can: {
    id: null,
    name: null,
    serial: null,
    size: null,
    requiresMaintenance: null,
    outOfService: null,
    source: null,
    startDate: null,
    hazardous: null,
    action: null,
    timestamp: null,
    createdBy: null,
    createdDate: null,
    modifiedBy: null,
    modifiedDate: null,
  },
  id: 2056967,
  workOrderId: 200486,
  type: 'NOTE',
  note: {
    text: 'Reassigned from Bert Rodriguez Rt13 to Manuel Berlin Rt 24',
    driverId: 65,
    newState: 'REASSIGNMENT',
  },
  createdBy: 'alycia.hilzer@5280waste.com',
  createdDate: '2019-08-26T00:53:45.680Z',
  modifiedBy: null,
  modifiedDate: '2019-08-26T00:53:45.680Z',
  deleted: 0,
};

describe('<WorkOrderHistoryNote />', () => {
  it('should render correctly with props', () => {
    const component = shallow(
      <WorkOrderHistoryNote
        data={data}
        timezone={timezone}
        notesStates={notesStates}
      />,
    );

    expect(component).toMatchSnapshot();
  });
  it('should have the classname note--transition added for a TRANSITION type by noteClassNameByType', () => {
    const wrapper = mount(
      <WorkOrderHistoryNote
        data={data}
        timezone={timezone}
        notesStates={notesStates}
      />,
    );
    expect(wrapper.find('.note').hasClass('note--transition')).toEqual(true);
  });
  it('should have the classname note--default added for a NOTE type by noteClassNameByType', () => {
    const wrapper = mount(
      <WorkOrderHistoryNote
        data={dataNote}
        timezone={timezone}
        notesStates={notesStates}
      />,
    );
    expect(wrapper.find('.note').hasClass('note--default')).toEqual(true);
  });
});
