import React from 'react';
import renderer from 'react-test-renderer';
import App from '.';<% if (isTS) { %>
import type { AppProps } from '.';<% } %>

describe('App', () => {
  test('It renders', () => {
    const props<% if (isTS) { %>: AppProps<% } %> = { x: 42, y: 'text', z: true };
    const component = renderer.create(<App {...props} />);

    let tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });
});
