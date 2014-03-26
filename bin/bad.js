#!/usr/bin/env node

'use strict';

//dependencies
var async = require('async');
var program = require('commander');

var batch;

//helpers
var helpers = require('../lib/helpers');
var absPathOf = helpers.absPathOf;
var by = helpers.by;
var commandInPath = helpers.commandInPath;
var createExecTask = helpers.createExecTask;
var fileExistsSync = helpers.fileExistsSync;
var hr = helpers.hr;
var merge = helpers.merge;
var splitSpaceDelimted = helpers.splitSpaceDelimted;
var to = helpers.to;

//defaults
var argv = [];
var execArg = null;
var isDebug = false;

//exit codes
var MISSING_OPTION=1;
var ERROR_WHILE_EXECUTING=2;
var TASK_EXITED_ABNORMALLY=3;
var EXEC_NOT_FOUND=4;

//misc
var startTime = Date.now();
var tasks = [];

program
  .version(require('../package.json').version)
  .description(
    'bad is a command line tool that allows you to execute a command multiple '
    +'times concurrently for a given number of subjects.'
  )
  .usage('--exec curl --for "google.com linkedin.com" --argv "-s"')
  .option('--debug', 'print information for debugging')
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
  .option('--to-env [varname]', 'an env var representing the subject for the command.')
  .option('--show-time', 'display time stats.');

program.parse(process.argv);

//Handle Options
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

isDebug = !!program.debug;

if(isDebug){
  console.log([
    hr('debug'),
    'Debug info: ',
    '--silent: '+program.silent,
    '--to-env: '+program.toEnv,
    '--argv: '+program.argv,
    '--exec: '+program.exec,
    '--for: '+program.for
  ].join('\n'));
}

program.for.forEach(function(subject){
  tasks.push(createExecTask.bind(null, execArg, subject, program));
});

async.parallel(tasks, function(err, results){
  var hasStdout = !!results.filter(by('stdout')).length;
  var hasStderr = !!results.filter(by('stderr')).length;


  if(program.showTime){
    console.log(hr('time stats'));
    results.forEach(function(result){
      console.log('For '+result.subject+':');
      console.log('  '+result.time+'ms');
    });
    console.log('Total Time:\n  '+(Date.now()-startTime)+'ms');
  }

  if(hasStdout && (program.debug || !program.silent)){
    console.log(hr('stdout'));
    results.filter(by('stdout')).forEach(function(result){
      console.log('For '+result.subject+':');
      console.log(result.stdout);
    });
  }

  if(hasStderr && (program.debug || !program.silent)){
    console.error(hr('stderr'));
    results.filter(by('stderr')).forEach(function(result){
      console.error('For '+result.subject+':');
      console.error(result.stderr);
    });
  }

  if(hasStdout || hasStderr){
    hr();
  }

  if(err){
    console.error('The following command[s] exited abnormally:');
    results.filter(by('err')).forEach(function(result){
      console.error(result.subject);
    });
    process.exit(ERROR_WHILE_EXECUTING);
  }
});
