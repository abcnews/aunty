import { shallowMount } from '@vue/test-utils';
import <%= className %> from './<%= className %>.vue';

describe('<%= className %>', () => {
  it('renders a snapshot', () => {
    const component = shallowMount(<%= className %>, {
      propsData: {}
    });
    expect(component.html()).toMatchSnapshot();
  });
});
