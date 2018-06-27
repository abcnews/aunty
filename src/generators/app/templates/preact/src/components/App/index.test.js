const { h } = require('preact');
const render = require('preact-render-to-string');
const htmlLooksLike = require('html-looks-like');

const App = require('.');

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
