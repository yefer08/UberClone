/**
 * @format
 */

import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import App from '../App';

jest.mock('react-native-localize', () => ({
  getLocales: () => [{ languageCode: 'es' }],
}));

jest.mock('react-native-config', () => ({
  GOOGLE_MAPS_API_KEY: 'test-key',
}));

jest.mock('../src/store/store', () => ({
  store: {
    getState: () => ({}),
    dispatch: jest.fn(),
    subscribe: jest.fn(),
  },
}));

jest.mock('../src/navigation/AppNavigator', () => {
  const ReactLib = require('react');
  const { Text } = require('react-native');

  function MockAppNavigator() {
    return ReactLib.createElement(Text, null, 'Mock Navigator');
  }

  return MockAppNavigator;
});

test('renders correctly', async () => {
  await ReactTestRenderer.act(() => {
    ReactTestRenderer.create(<App />);
  });
});
