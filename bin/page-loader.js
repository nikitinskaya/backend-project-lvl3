#!/usr/bin/env node

import program from 'commander';
import pageLoader from '../src/index.js';

program
  .version('0.0.1', '-V, --version', 'output the version number')
  .description('Downloads web pages with resources')
  .option('-o, --output <dirPath>', 'output dir path', process.cwd())
  .arguments('<link>')
  .action(async (url, { output }) => {
    const name = await pageLoader(url, output);
    console.log(name);
  });
program.parse(process.argv);