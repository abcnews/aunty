const React = require('react');
const renderer = require('react-test-renderer');

const App = require('.');

describe('App', () => {
  test('It renders', () => {
    const component = renderer.create(<App projectName="test-project" />);

    let tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });
});
