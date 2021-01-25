#!/usr/bin/env node

import program from 'commander';
import pageLoader from '../src/index.js';

program
  .version('0.0.1', '-V, --version', 'output the version number')
  .description('Downloads web pages with resources')
  .arguments('<link>')
  .action((url) => {
    console.log(pageLoader(url));
  });
program.parse(process.argv);
