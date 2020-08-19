import App from './index';

test('it renders', () => {
  const component = new App({ projectName: 'test-project' });

  expect(component.el.innerHTML).toContain('test-project');
});
