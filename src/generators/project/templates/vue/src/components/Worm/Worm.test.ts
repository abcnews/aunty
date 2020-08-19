import { shallowMount } from '@vue/test-utils';
import Worm from './Worm.vue';

describe('Worm', () => {
  it('should render correct contents', () => {
    const wrapper = shallowMount(Worm);

    expect(wrapper.find('img')).toBeDefined();
    expect(wrapper.find('img').attributes('src')).toBe('worm.svg');
  });

  it('renders a snapshot', () => {
    const wrapper = shallowMount(Worm);

    expect(wrapper.html()).toMatchSnapshot();
  });
});
