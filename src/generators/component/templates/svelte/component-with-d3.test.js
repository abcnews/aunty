import { render } from '@testing-library/svelte'
import <%= className %> from './<%= className %>.svelte';

describe('<%= className %>', () => {
  it('renders a snapshot', () => {
    const { container } = render(<%= className %>);

    expect(container).toMatchSnapshot();
  });
});
