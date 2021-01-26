#!/usr/bin/env node

import program from 'commander';
import pageLoader from '../src/index.js';

program
  .version('0.0.1', '-V, --version', 'output the version number')
  .description('Downloads web pages with resources')
  .option('-o, --output <dirPath>', 'output dir path', process.cwd())
  .arguments('<link>')
  .action((url, { output }) => {
    pageLoader(url, output)
      .then((name) => console.log(name))
      .catch((err) => {
        console.error(err);
        process.exit(1);
      });
  });
program.parse(process.argv);
