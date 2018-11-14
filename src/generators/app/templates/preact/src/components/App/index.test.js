import { h }  from 'preact';
import render from 'preact-render-to-string';
import htmlLooksLike from 'html-looks-like';

import App from '.';

describe('App', () => {
  test('It renders', () => {
    const actual = render(<App projectName="test-project" />);
    const expected = `
      <div>
        {{ ... }}
        <h1>test-project</h1>
      </div>
    `;

    htmlLooksLike(actual, expected);
  });
});
