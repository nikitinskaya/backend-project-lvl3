/**
 * @jest-environment node
 */

import nock from 'nock';
import {
  test, expect, beforeAll, beforeEach,
} from '@jest/globals';
import { promises as fs } from 'fs';
import path from 'path';
import os from 'os';
import pageLoader from '../src/index.js';

const link = 'https://ru.hexlet.io/courses';
const savedName = 'ru-hexlet-io-courses.html';
const outputHTMLFile = 'ru-hexlet-io-courses.output.html';

const getFixturePath = (name) => `__tests__/__fixtures__/${name}`;
const fileExists = async (filepath) => fs.access(filepath)
  .then(() => true)
  .catch(() => false);

nock.disableNetConnect();

let outputDir;
let outputHTML;

beforeAll(async () => {
  outputHTML = await fs.readFile(getFixturePath(outputHTMLFile), 'utf-8');
  nock('https://ru.hexlet.io').get('/courses').reply(200, outputHTML, { 'Access-Control-Allow-Origin': '*' });
});

beforeEach(async () => {
  outputDir = await fs.mkdtemp(path.join(os.tmpdir(), 'page-loader-'));
});

test('Download', async () => {
  await pageLoader(link, outputDir);

  const fileCreated = await fileExists(path.join(outputDir, savedName));
  expect(fileCreated).toBe(true);

  const fileContent = await fs.readFile(path.join(outputDir, savedName), 'utf-8');
  expect(fileContent).toEqual(outputHTML.trim());
});
