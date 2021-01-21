import { h } from 'preact';
import render from 'preact-render-to-string';
import htmlLooksLike from 'html-looks-like';
import App from '.';<% if (isTS) { %>
import type { AppProps } from '.';<% } %>

describe('App', () => {
  test('It renders', () => {
    const props<% if (isTS) { %>: AppProps<% } %> = { x: 42, y: 'text', z: true };
    const actual = render(<App {...props} />);
    const expected = `
      <div>
        {{ ... }}
        <pre>${JSON.stringify(props)}</pre>
        <h1><%= projectName %></h1>
      </div>
    `;

    htmlLooksLike(actual, expected);
  });
});
