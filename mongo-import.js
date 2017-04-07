#!/usr/bin/env node
'use strict'; // eslint-disable-line strict

const program = require('commander');
const parse   = require('url-parse');
const spawn   = require('child_process').spawn;
const colour  = require('cli-color');
const _       = require('lodash');

const red    = colour.red;
const green  = colour.green;
const yellow = colour.yellow;

const mongoUrls = {
  'local': 'mongodb://localhost:27017/dev',
  'dev':   'mongodb://docdb-acdcdev:91N1ehbLBNV1I695qjXsHQHyDkNItz64MoZwh66ebOWRO9TZiOVIeakLToJgHBgluxgVfPxVcJ057RXQInafrA==@docdb-acdcdev.documents.azure.com:14334/dev?ssl=true',
  'qa':    'mongodb://docdb-acdcqa:O1B29nNwg292n4WIMOVmZsmm9rSeXZfC59w095GHt78mdlX8efycJ8kbAk7HnJ5PJgzDvLESR9voUyBJAwzeDQ==@docdb-acdcqa.documents.azure.com:14338/gbi?ssl=true',
  'uat':   'mongodb://docdb-acdcuat:DMO2WGrmgAvV7Mgcc7gNnv2AcN777WaW5WXu3hTqZqv1pyy0m5O3UwdGcpC2jwiBJHjHs6mKXWvdx9cOeLruuw==@docdb-acdcuat.documents.azure.com:10250/gbi?ssl=true'
};

const validEnvironments = _.keys(mongoUrls);
var importStarted = false;

const exit = message => {
  console.log(message);
  process.exit(1);
};

const validateEnvironment = env => {
  if (! _.includes(validEnvironments, env)) {
    exit(`  error:invalid environment '${env}' - should be one of '${validEnvironments.join("', '")}'`);
  }
};

const doImport = (mongoUrl, csv, collection) => {
  const url = parse(mongoUrl, true);
  const database = url.pathname.substr(1);

  console.log(yellow(`Importing '${csv}' to the '${collection}' collection in the '${database}' database on '${url.hostname}:${url.port}'`));

  let args = ['--type=csv', '--headerline', '--drop', `--file=${csv}`, `--collection=${collection}`];

  function appendArg(option, value) {
    if (value !== '' && value !== undefined) {
      args.push(`--${option}=${value}`);
    }
  }

  appendArg('host',     url.hostname);
  appendArg('port',     url.port);
  appendArg('username', url.username);
  appendArg('password', url.password);
  appendArg('db',       database);

  if (url.query.ssl === 'true') {
    args.push('--ssl');
  }

  const importProcess = spawn('mongoimport', args);

  function log(colour, string) {
    string.split(/(\r?\n)/g).forEach((line) => {
      const output = line.replace(/\s+$/, '').replace(/^[^\s]*/, '').replace(/^\s+/, '  ');
      if (output !== '') {
        console.log(colour(output));
      }
    });
  }

  importProcess.stderr.on('data', data => {
    const string = data.toString();
    const colour = string.match(/(failed|imported 0)/i) ? red : yellow;
    log(colour, string);
  });

  importProcess.on('close', code => {
    const message = code === 0 ? green('  Import succeeded.\n') : red(`  Import to ${url} failed (code=${code})\n`);
    console.log(message);
  });
};

program
  .arguments('<env> <csv> <collection>')
  .action( (env, csv, collection) => {
    validateEnvironment(env);
    importStarted = true;
    doImport(mongoUrls[env], csv, collection);
  });

program.parse(process.argv);

if (!importStarted) {
  console.log(`  error: missing required argument 'env' - should be one of '${validEnvironments.join("', '")}'`);
}
