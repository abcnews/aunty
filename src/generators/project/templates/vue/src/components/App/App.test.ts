import { shallowMount } from '@vue/test-utils';
import App from './App.vue';

const props = { x: 42, y: 'text', z: true };

describe('App', () => {
  it('should render correct contents', () => {
    const wrapper = shallowMount(App, {
      propsData: {
        ...props
      }
    });
    expect(wrapper.find('pre').text()).toContain(JSON.stringify(props));
  });

  it('renders a snapshot', () => {
    const wrapper = shallowMount(App, {
      propsData: {
        ...props
      }
    });
    expect(wrapper.html()).toMatchSnapshot();
  });
});
