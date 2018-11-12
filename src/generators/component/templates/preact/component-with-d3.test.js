import { h }  from 'preact';
import render from 'preact-render-to-string';
import htmlLooksLike from 'html-looks-like';

import <%= className %> from '.';

describe('<%= className %>', () => {
  test('It renders', () => {
    const actual = render(<<%= className %> />);
    const expected = `
      <div></div>
    `;

    htmlLooksLike(actual, expected);
  });
});
