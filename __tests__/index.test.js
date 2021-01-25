import nock from 'nock';
import { test, expect } from '@jest/globals';
import pageLoader from '../src/index.js';

const link = 'https://ru.hexlet.io/courses';
const savedName = 'ru-hexlet-io-courses.html';

nock.disableNetConnect();

test('Get slugified url', async () => {
  const name = await pageLoader(link);

  expect(name).toEqual(savedName);
});
