'use strict';

describe('helpers', function(){
  var assert = require('assert');
  var helpers = require('../lib/helpers');

  describe('#hr', function(){
    var hr = helpers.hr;

    it('outputs equal signs', function(){
      hr().should.equal('=======================================');
    });

    it('centers an odd word', function(){
      hr('boo').should.equal('==================BOO==================');
    });

    it('centers an even word', function(){
      hr('booo').should.equal('=================BOOO==================');
    });
  });

  describe('#createExecTaskContexts', function(){
    var createExecTaskContexts = helpers.createExecTaskContexts;

    it('returns an array', function(){
      createExecTaskContexts({}).length.should.equal(0);
    });

    it('sets toEnv to null when program.toEnv is not set', function(){
      var program = {for:'3 4 5'};
      var contexts = createExecTaskContexts(program);
      contexts[0].subject.should.equal('3');
      assert.equal(contexts[0].toEnv, null);
      contexts[1].subject.should.equal('4');
      assert.equal(contexts[1].toEnv, null);
      contexts[2].subject.should.equal('5');
      assert.equal(contexts[2].toEnv, null);
    });

    it('sets toEnv to the correct env var when program.toEnv is set once', function(){
      var program = {for:'3 4 5, 2 1', toEnv: 'DOG'};
      var contexts = createExecTaskContexts(program);
      contexts[0].subject.should.equal('3');
      contexts[0].toEnv.should.equal('DOG');
      contexts[1].subject.should.equal('4');
      contexts[1].toEnv.should.equal('DOG');
      contexts[2].subject.should.equal('5');
      contexts[2].toEnv.should.equal('DOG');
      contexts[3].subject.should.equal('2');
      contexts[3].toEnv.should.equal('DOG');
      contexts[4].subject.should.equal('1');
      contexts[4].toEnv.should.equal('DOG');
    });

    it('sets toEnv to the correct env var when program.toEnv is set twice', function(){
      var program = {for:'3 4 5, 2 1', toEnv: 'DOG FOO, SEE'};
      var contexts = createExecTaskContexts(program);
      contexts[0].subject.should.equal('3');
      contexts[0].toEnv.should.equal('DOG');
      contexts[1].subject.should.equal('4');
      contexts[1].toEnv.should.equal('FOO');
      contexts[2].subject.should.equal('5');
      contexts[2].toEnv.should.equal('FOO');
      contexts[3].subject.should.equal('2');
      contexts[3].toEnv.should.equal('SEE');
      contexts[4].subject.should.equal('1');
      contexts[4].toEnv.should.equal('SEE');
    });

    it('sets toEnv correctly for strange cases', function(){
      var program = {for:'1, 3 4 5, 2 1,,2', toEnv: 'DOG FOO, SEE'};
      var contexts = createExecTaskContexts(program);
      contexts[0].subject.should.equal('1');
      contexts[0].toEnv.should.equal('DOG');
      contexts[1].subject.should.equal('3');
      contexts[1].toEnv.should.equal('SEE');
      contexts[2].subject.should.equal('4');
      contexts[2].toEnv.should.equal('SEE');
      contexts[3].subject.should.equal('5');
      contexts[3].toEnv.should.equal('SEE');
      contexts[4].subject.should.equal('2');
      contexts[4].toEnv.should.equal('SEE');
      contexts[5].subject.should.equal('1');
      contexts[5].toEnv.should.equal('SEE');
      contexts.length.should.equal(7);
    });

  });
});
