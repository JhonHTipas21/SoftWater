/**
 * @format
 */

import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import App from '../App';
import { mockIrrigationRepository } from '../src/data/repositories/MockIrrigationRepository';

afterAll(() => {
  mockIrrigationRepository.destroy();
});

test('renders correctly', async () => {
  await ReactTestRenderer.act(() => {
    ReactTestRenderer.create(<App />);
  });
});
