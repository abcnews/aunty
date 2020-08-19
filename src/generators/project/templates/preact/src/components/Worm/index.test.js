import { h } from 'preact';
import render from 'preact-render-to-string';
import htmlLooksLike from 'html-looks-like';

import Worm from '.';

describe('Worm', () => {
  test('It renders', () => {
    const actual = render(<Worm />);
    const expected = `<img src="worm.svg">`;

    htmlLooksLike(actual, expected);
  });
});
