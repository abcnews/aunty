import { shallowMount } from '@vue/test-utils';
import <%= className %> from '../<%= className %>.vue';

describe('<%= className %>', () => {
  it('renders a snapshot', () => {
    const wrapper = shallowMount(<%= className %>, {
      propsData: {}
    });
    expect(wrapper.html()).toMatchSnapshot();
  });
});


