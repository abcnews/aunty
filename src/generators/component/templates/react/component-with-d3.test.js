const React = require('react');
const renderer = require('react-test-renderer');

const <%= className %> = require('../<%= className %>');

describe('<%= className %>', () => {
  test('It renders', () => {
    const component = renderer.create(<<%= className %> />);

    let tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });
});
