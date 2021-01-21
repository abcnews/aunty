import { render } from '@testing-library/svelte';
import App from './App.svelte';

const props = { x: 42, y: 'text', z: true };

describe('App', () => {
  it('should render correct contents', () => {
    const { container } = render(App, {...props});

    expect(container.textContent).toContain(JSON.stringify(props));
  });

  it('renders a snapshot', () => {
    const { container } = render(App, {...props});

    expect(container).toMatchSnapshot();
  });
});
