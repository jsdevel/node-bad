'use strict';

var async = require('async');
var fs = require('fs');
var once = require('once');

module.exports = {
  captureStream : captureStream,
  dump : dump,
  fileExistsSync  : fileExistsSync,
  getOutput : getOutput,
  merge : merge,
  splitSpaceDelimted : splitSpaceDelimted
};


function captureStream(arr, prop, proc){
  arr.push(proc[prop]);
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

function fileExistsSync(file){
  return fs.existsSync(file) && fs.statSync(file).isFile();
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
