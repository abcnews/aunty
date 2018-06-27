const <%= className %> = require('.');

test('it renders', () => {
  const component = new <%= className %>();

  expect(component.el.innerHTML).toContain('<svg');
});