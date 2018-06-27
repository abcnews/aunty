const { h } = require('preact');
const render = require('preact-render-to-string');
const htmlLooksLike = require('html-looks-like');

const <%= className %> = require('../<%= className %>');

describe('<%= className %>', () => {
  test('It renders', () => {
    const actual = render(<<%= className %> />);
    const expected = `
      <div></div>
    `;

    htmlLooksLike(actual, expected);
  });
});
