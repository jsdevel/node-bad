'use strict';

module.exports.splitSpaceDelimted = splitSpaceDelimted;

function splitSpaceDelimted(str){
  return str.replace(/\s+/g, ' ').split(' ');
}
