import Worm from './index';

test('it renders', () => {
  const component = new Worm();

  expect(component.el.src).toContain('worm.svg');
});
