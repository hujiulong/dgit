#!/usr/bin/env node

const program = require('commander');
const github = require('../lib/github');
const version = require('../package.json').version;

/* eslint-disable no-console */

const log = console.log;

function parseSource(source) {
  const result = /^((\S+):)?([\w-]+)\/([\w-\.]+)(\/(\S*))?$/.exec(source);

  if (!result) return null;

  let path = result[6] || '';

  if (path && path !== '' && path.charAt(path.length - 1) === '/') path = path.substring(0, path.length - 1); // src/ -> src

  return {
    origin: result[2] || 'github',
    owner: result[3],
    repo: result[4],
    path,
  };
}

function excute() {
  program
    .version(version)
    .usage('<owner-535/repo@ref/path> [dest]')
    .option('-r, --ref [value]', 'specify the reference. such as tag, branch or commit hash.')
    .parse(process.argv);

  const source = program.args[0];
  const rawName = program.args[1];
  const dest = (!rawName || rawName === '.') ? '' : rawName;
  // const clone = program.clone || false
  const ref = program.ref || 'master';

  const info = parseSource(source);

  if (!info) {
    log('Error: parameter is illegal.');
    log();
    log('Usage:');
    log('    dgit <owner/repo@ref/path> [dest]');
    log();
    return;
  }

  if (info.origin === 'github') {
    github(info.owner, info.repo, ref, info.path, dest);
  }
}

excute();
