const <%= className %> = require('../<%= className %>');

test('it renders', () => {
  const component = new <%= className %>();

  expect(component.el.innerHTML).toContain('<svg');
});