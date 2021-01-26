/**
 * @jest-environment node
 */

import nock from 'nock';
import {
  describe, test, expect, beforeAll, beforeEach,
} from '@jest/globals';
import { promises as fs } from 'fs';
import path from 'path';
import os from 'os';
import pageLoader from '../src/index.js';

const base = 'https://ru.hexlet.io';
const link = 'https://ru.hexlet.io/courses';
const invalidBase = 'https://example.com';
const savedName = 'ru-hexlet-io-courses.html';
const inputHTMLFile = 'ru-hexlet-io-courses.input.html';
const outputHTMLFile = 'ru-hexlet-io-courses.output.html';
const assetsPath = 'ru-hexlet-io-courses_files';

const getFixturePath = (name) => `__tests__/__fixtures__/${name}`;
const fileExists = async (filepath) => fs.access(filepath)
  .then(() => true)
  .catch(() => false);

nock.disableNetConnect();

let outputDir;
let inputHTML;
let outputHTML;
let resources = [
  {
    format: 'png',
    urlPath: '/assets/professions/nodejs.png',
    filename: path.join(
      assetsPath,
      'ru-hexlet-io-assets-professions-nodejs.png',
    ),
  },
  {
    format: 'js',
    urlPath: '/packs/js/runtime.js',
    filename: path.join(
      assetsPath,
      'ru-hexlet-io-packs-js-runtime.js',
    ),
  },
  {
    format: 'css',
    urlPath: '/assets/application.css',
    filename: path.join(
      assetsPath,
      'ru-hexlet-io-assets-application.css',
    ),
  },
];
const formats = resources.map(({ format }) => format);
const textFormats = [];
const scope = nock(base).persist();

beforeAll(async () => {
  inputHTML = await fs.readFile(getFixturePath(inputHTMLFile), 'utf-8');
  outputHTML = await fs.readFile(getFixturePath(outputHTMLFile), 'utf-8');
  scope.get('/courses').reply(200, inputHTML, { 'Access-Control-Allow-Origin': '*' });

  const promises = resources.map((res) => fs.readFile(getFixturePath(res.filename), 'utf-8')
    .then((data) => ({ ...res, data })));
  resources = await Promise.all(promises);
  resources.forEach(({ urlPath, data }) => scope.get(urlPath).reply(200, data));
});

beforeEach(async () => {
  outputDir = await fs.mkdtemp(path.join(os.tmpdir(), 'page-loader-'));
});

describe('Positive cases', () => {
  test('Can\'t download page', async () => {
    await pageLoader(link, outputDir);

    const fileCreated = await fileExists(path.join(outputDir, savedName));
    expect(fileCreated).toBe(true);

    const fileContent = await fs.readFile(path.join(outputDir, savedName), 'utf-8');
    expect(fileContent).toEqual(outputHTML.trim());
  });

  test.each(formats)('check .%s-resource', async (format) => {
    await pageLoader(link, outputDir);
    const { filename, data } = resources.find((content) => content.format === format);
    const fileWasCreated = await fileExists(path.join(outputDir, filename));
    expect(fileWasCreated).toBe(true);

    if (textFormats.includes(format)) {
      const actualContent = await fs.readFile(path.join(outputDir, filename), 'utf-8');
      expect(actualContent).toEqual(data);
    }
  });
});

describe('Negative cases', () => {
  test.each([404, 500])('Download page errors', async (code) => {
    nock(invalidBase).get('/').reply(code, '');
    await expect(pageLoader(invalidBase, outputDir))
      .rejects.toThrow();
  });
  test('File access errors', async () => {
    const root = '/';
    await expect(pageLoader(link, root))
      .rejects.toThrow();

    await expect(pageLoader(link.toString(), getFixturePath('404')))
      .rejects.toThrow();
  });
});
