import { render } from '@testing-library/svelte';
import Worm from './Worm.svelte';

describe('Worm', () => {
  it('should render correct contents', () => {
    const { container } = render(Worm);

    expect(container.querySelector('img')).toBeDefined();
  });

  it('renders a snapshot', () => {
    const { container } = render(Worm);

    expect(container).toMatchSnapshot();
  });
});
