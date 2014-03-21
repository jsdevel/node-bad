#!/usr/bin/env node

'use strict';

//dependencies
var async = require('async');
var concurrency = require('concurrency');
var program = require('commander');
var Process = concurrency.Process;
var Callback = concurrency.Callback;

var batch;

//helpers
var helpers = require('../lib/helpers');
var absPathOf = helpers.absPathOf;
var captureStream = helpers.captureStream;
var dump = helpers.dump;
var commandInPath = helpers.commandInPath;
var fileExistsSync = helpers.fileExistsSync;
var getOutput = helpers.getOutput;
var merge = helpers.merge;
var splitSpaceDelimted = helpers.splitSpaceDelimted;

//defaults
var argv = [];
var execArg = null;
var isSilent = false;
var isVerbose = false;

//exit codes
var MISSING_OPTION=1;
var ERROR_WHILE_EXECUTING=2;
var TASK_EXITED_ABNORMALLY=3;
var EXEC_NOT_FOUND=4;

program
  .version(require('../package.json').version)
  .description(
    'bad is a command line tool that allows you to execute a command multiple '
    +'times concurrently for a given number of subjects.'
  )
  .usage('--exec curl --for "google.com linkedin.com" --argv "-s"')
  .option('--verbose', 'show the output verbosley.')
  .option('-s, --silent', 'show as little as possible.')
  .option('--exec <command>', 'the command to run.  This is passed directly to spawn.')
  .option('--for <subjects>'
    , 'a whitespace separated list of subjects.'
    + '  Each subject is appended to argv except when --to-env is given.'
    , splitSpaceDelimted
  )
  .option('--argv [args]'
    , 'a whitespace separated list of arguments to pass to the command.'
    , splitSpaceDelimted
  )
  .option('--to-env [varname]', 'an env var representing the subject for the command.');

program.parse(process.argv);

if(!program.exec || !program.for){
  if(!program.exec)console.error('--exec is required!');
  if(!program.for)console.error('--for is required!');
  
  program.help();
  process.exit(MISSING_OPTION);
}

if(program.argv){
  argv = program.argv;
}

if(!fileExistsSync(program.exec) && !commandInPath(program.exec)){
  console.error('The --exec arg must refer to a command in your PATH or a file.');
  process.exit(EXEC_NOT_FOUND);
}

if(fileExistsSync(program.exec))execArg = absPathOf(program.exec);
else execArg = program.exec;

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
    if(err){
      console.error('An error occurred while executing the tasks:');
      console.error(err);
      process.exit(ERROR_WHILE_EXECUTING);
    }

    if(hasError){
      console.log('The following subjects exited abnormally:');
      tasks.forEach(function(task, index){
        if(task.exitCode)console.log(program.for[index]);
      });
      process.exit(TASK_EXITED_ABNORMALLY);
    }
  });
});

program.for.forEach(function(subject){
  var config = {
    command: execArg,
    args:[].concat(argv)
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
  } else {
    config.args.push(subject);
  }

  batch.follows(new Process(config));
});

batch.run();
