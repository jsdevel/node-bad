#!/usr/bin/env node

'use strict';

var async = require('async');
var once = require('once');
var program = require('commander');
var concurrency = require('concurrency');
var Process = concurrency.Process;
var Callback = concurrency.Callback;

var batch;
var helpers = require('../lib/helpers');


var splitSpaceDelimted = helpers.splitSpaceDelimted;
var isSilent = false;
var isVerbose = false;

program
  .version(require('../package.json').version)
  .usage('--exec my-command --for "1 2 3 4"')
  .option('--verbose', 'Show the output verbosley.')
  .option('-s, --silent', 'Show as little as possible.')
  .option('--exec <command>', 'The command to run.  This is passed directly to spawn.')
  .option('--to-env <varname>', 'An env var representing the subject for the command.')
  .option('--for <subjects>'
    , 'A white space separated list of arguments.'
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
    getOutput.bind(null, stdout, 'stdout'),
    getOutput.bind(null, stderr, 'stderr')
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

function dump(stream, cb){
  var out = [];
  cb = once(cb);

  stream
  .on('data', function(data){
    out.push(''+data);
  })
  .on('error', cb)
  .on('close', function(){
    cb(null, out.join(''));
  });
}

function captureStream(arr, prop, proc){
  arr.push(proc[prop]);
}

function getOutput(tasks, title, cb){
  var upper = title.toUpperCase();
  async.parallel(tasks, function(err, results){
    if(err)return cb(err);
    if(!isSilent && results.filter(function(a){return !!a;}).length){
      if(isVerbose)console.log('========='+upper+'==========');
      program.for.forEach(function(arg, index){
        if(isVerbose)console.log('This was the '+title+' of "'+arg+'":');
        console.log(results[index]);
      });
    }
    cb();
  });
}

function handleError(err){
  if(err){
    console.log(err);
    process.exit(1);
  }
}

function merge(old, additional){
  var prop;
  var proposed = {};

  for(prop in old){
    proposed[prop] = old[prop];
  }

  for(prop in additional){
    proposed[prop] = additional[prop];
  }
  return proposed;
}
