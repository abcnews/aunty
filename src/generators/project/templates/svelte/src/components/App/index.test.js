import { render } from '@testing-library/svelte';
import App from './App.svelte';

describe('App', () => {
  it('should render correct contents', () => {
    const { container } = render(App, { projectName: 'test-project' });

    expect(container.textContent).toContain('test-project');
  });

  it('renders a snapshot', () => {
    const { container } = render(App, {
      projectName: 'test-project'
    });

    expect(container).toMatchSnapshot();
  });
});
