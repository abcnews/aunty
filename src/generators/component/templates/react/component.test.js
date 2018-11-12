import React from 'react';
import renderer from 'react-test-renderer';

import <%= className %> from '.';

describe('<%= className %>', () => {
  test('It renders', () => {
    const component = renderer.create(<<%= className %> />);

    let tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });
});
