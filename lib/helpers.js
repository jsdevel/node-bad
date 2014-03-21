'use strict';

var async = require('async');
var once = require('once');

module.exports = {
  captureStream : captureStream,
  dump : dump,
  getOutput : getOutput,
  handleError : handleError,
  merge : merge,
  splitSpaceDelimted : splitSpaceDelimted
};

function splitSpaceDelimted(str){
  return str.replace(/\s+/g, ' ').split(' ');
}

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

function getOutput(program, tasks, title, cb){
  var upper = title.toUpperCase();
  var isVerbose = program.isVerbose;
  var isSilent = program.isSilent;

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
