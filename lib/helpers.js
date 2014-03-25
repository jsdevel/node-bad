'use strict';

var exec = require('child_process').exec;
var fs = require('fs');
var once = require('once');
var path = require('path');
var which = require('which');

module.exports = {
  absPathOf : absPathOf,
  commandInPath : commandInPath,
  createExecTask : createExecTask,
  fileExistsSync  : fileExistsSync,
  merge : merge,
  splitSpaceDelimted : splitSpaceDelimted
};


function absPathOf(file){
  return path.resolve(process.cwd(), file);
}

function commandInPath(cmd){
  try {
    which.sync(cmd);
    return true;
  } catch(e) {
    return false;
  }
}

function createExecTask(execArg, subject, program, cb){
  var args = [execArg].concat(program.argv);
  var env = process.env;

  if(program.toEnv){
    env = {};
    env[program.toEnv] = subject;
    env = merge(process.env, env);
  } else {
    args.push(subject);
  }

  exec(args.join(' '), {env: env}, function(err, stdout, stderr){
    cb(err, {
      subject: subject,
      err: err,
      stdout: stdout,
      stderr: stderr
    });
  });
}

function fileExistsSync(file){
  file = absPathOf(file);
  return fs.existsSync(file) && fs.statSync(file).isFile();
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

function splitSpaceDelimted(str){
  return str.replace(/\s+/g, ' ').split(' ');
}
