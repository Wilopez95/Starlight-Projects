import { shallow } from 'enzyme';

import Loader from './Loader';

describe('test Loader component', () => {
  it('should render', () => {
    const enzymeWrapper = shallow(<Loader />);

    expect(enzymeWrapper).toHaveLength(1);
  });
});
