/* eslint-env jest */
import { shallow } from 'enzyme';

import cssTransition from './../utils/cssTransition';

describe('cssTransition helper', () => {
  it('Should return a valid react node', () => {
    const Transition = cssTransition({
      enter: 'foo',
      exit: 'bar',
      duration: [100, 200],
    });
    const children = () => <div>Plop</div>;
    const component = shallow(<Transition>{children}</Transition>);
    expect(component).toHaveLength(1);
  });
});
