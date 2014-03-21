#!/usr/bin/env node

'use strict';

//dependencies
var async = require('async');
var program = require('commander');
var concurrency = require('concurrency');
var Process = concurrency.Process;
var Callback = concurrency.Callback;

var batch;

//helpers
var helpers = require('../lib/helpers');
var captureStream = helpers.captureStream;
var dump = helpers.dump;
var fileExistsSync = helpers.fileExistsSync;
var getOutput = helpers.getOutput;
var handleError = helpers.handleError;
var merge = helpers.merge;
var splitSpaceDelimted = helpers.splitSpaceDelimted;

//defaults
var isSilent = false;
var isVerbose = false;

program
  .version(require('../package.json').version)
  .usage('--exec my-command --for "1 2 3 4"')
  .option('--verbose', 'show the output verbosley.')
  .option('-s, --silent', 'show as little as possible.')
  .option('--exec <command>', 'the command to run.  This is passed directly to spawn.')
  .option('--to-env <varname>', 'an env var representing the subject for the command.')
  .option('--for <subjects>'
    , 'a white space separated list of arguments.'
    + 'Each arg is passed to the command as it\'s first arg.'
    , splitSpaceDelimted);

program.parse(process.argv);

if(!program.exec || !program.for)program.help();

isSilent = !!program.silent;
isVerbose = !isSilent && !!program.verbose;

batch = new Callback(function(done){
  var tasks = [].slice.call(arguments);
  var stdout = [];
  var stderr = [];
  var hasError;
  done = tasks.shift();
  hasError = !!tasks.filter(function(v){return !!v.exitCode;}).length;

  tasks.forEach(captureStream.bind(null, stdout, 'stdout'));
  tasks.forEach(captureStream.bind(null, stderr, 'stderr'));

  stdout = stdout.map(function(stream){
    return dump.bind(null, stream);
  });
  stderr = stderr.map(function(stream){
    return dump.bind(null, stream);
  });

  async.parallel([
    getOutput.bind(null, program, stdout, 'stdout'),
    getOutput.bind(null, program, stderr, 'stderr')
  ], function(err){
    handleError(err);
    if(hasError){
      console.log('The following subjects exited abnormally:');
      tasks.forEach(function(task, index){
        if(task.exitCode)console.log(program.for[index]);
      });
      process.exit(3);
    }
  });
});

program.for.forEach(function(subject){
  var config = {
    command: program.exec,
    args:[subject]
  };
  var env;
  var newEnv;

  if(program.toEnv){
    env = {};
    env[program.toEnv] = subject;
    newEnv = merge(process.env, env);
    config.options = {
      env: newEnv
    };
  }

  batch.follows(new Process(config));
});

batch.run();
