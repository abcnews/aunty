import App from './index';<% if (isTS) { %>
import type { AppProps } from './index';<% } %>

test('it renders', () => {
  const props<% if (isTS) { %>: AppProps<% } %> = { x: 42, y: 'text', z: true };
  const component = new App(props);

  expect(component.el.innerHTML).toContain(JSON.stringify(props));
});
