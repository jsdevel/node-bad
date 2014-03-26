'use strict';

describe('helpers', function(){
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
});
