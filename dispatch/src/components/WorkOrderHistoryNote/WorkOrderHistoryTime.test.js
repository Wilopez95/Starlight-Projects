import { render } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import WorkOrderHistoryTime from './WorkOrderHistoryTime';

const testDate = '2019-08-26T00:53:45.680Z';

describe('<WorkOrderHistoryTime />', () => {
  it('should render correctly with props', () => {
    const component = render(<WorkOrderHistoryTime createdDate={testDate} />);

    expect(component).toMatchSnapshot();
  });
  it('should display the time using America/Denver if no timezone is provided', () => {
    const { queryAllByText } = render(<WorkOrderHistoryTime createdDate={testDate} />);
    expect(queryAllByText('06:53 pm')[0]).toBeInTheDocument();
  });
  it('should display the time based on the passed timezone prop', () => {
    const { queryByText } = render(
      <WorkOrderHistoryTime createdDate={testDate} timezone="America/Los_Angeles" />,
    );
    expect(queryByText('05:53 pm')).toBeInTheDocument();
  });
});
