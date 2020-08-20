import { shallowMount } from '@vue/test-utils';
import App from './App.vue';

describe('App', () => {
  it('should render correct contents', () => {
    const wrapper = shallowMount(App, {
      propsData: {
        projectName: 'test-project'
      }
    });
    expect(wrapper.find('h1').text()).toContain('test-project');
  });

  it('renders a snapshot', () => {
    const wrapper = shallowMount(App, {
      propsData: {
        projectName: 'test-project'
      }
    });
    expect(wrapper.html()).toMatchSnapshot();
  });
});
