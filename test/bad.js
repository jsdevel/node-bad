'use strict';

describe('bad', function(){
  var assert = require('assert');
  var exec = require('child_process').exec;
  var path = require('path');
  var bad = path.resolve(__dirname, '..', 'bin', 'bad.js');
  var fixtures = path.resolve(__dirname, '..', 'test-fixtures');
  var abnormalExit = path.resolve(fixtures, 'abnormal-exit.bash');
  var multipleMapping = path.resolve(fixtures, 'multiple-mapping.bash');
  var printArgvWithEnv = path.resolve(fixtures, 'print-argv-with-env.bash');
  var printArgvWithoutEnv = path.resolve(fixtures, 'print-argv-without-env.bash');
  var printSubject = path.resolve(fixtures, 'print-subject.bash');
  var commandWithSpace = path.resolve(fixtures, 'command\\ with\\ space.bash');
  var printEnv = path.resolve(fixtures, 'print-env-FOO.bash');
  var writeToStdErr = path.resolve(fixtures, 'write-to-stderr.bash');

  it('exits normally on normal exit codes', function(done){
    exec([
      bad,
      '--exec', printSubject,
      '--for', '"2 3 4 5"'
    ].join(' '),
    function(err, out, stderr){
      assert(!err);
      stderr.should.equal('');
      out.should.equal([
        '================STDOUT=================\n'
        + 'For 2:\n2',
        'For 3:\n3',
        'For 4:\n4',
        'For 5:\n5',
        ''
      ].join('\n\n'));
      done();
    });
  });

  it('handles commands with spaces', function(done){
    exec([
      bad,
      '--exec', commandWithSpace,
      '--for', '"2 3 4 5"'
    ].join(' '),
    function(err, out, stderr){
      assert(!err);
      stderr.should.equal('');
      out.should.equal([
        '================STDOUT=================\n'
        + 'For 2:\n2',
        'For 3:\n3',
        'For 4:\n4',
        'For 5:\n5',
        ''
      ].join('\n\n'));
      done();
    });
  });

  it('exits abnormally on bad exit codes', function(done){
    exec(bad+' --exec '+abnormalExit+' --for "2 3 4 5"', function(err, out, stderr){
      out.should.equal('');
      stderr.should.startWith('The following command[s] exited abnormally:');
      err.code.should.equal(2);
      done();
    });
  });

  it('exits normally if stderr output exists', function(done){
    exec([bad,'--exec',writeToStdErr,'--for','"2 3 4 5"'].join(' '), function(err, out, stderr){
      out.should.equal('');
      assert(!err);
      stderr.should.equal([
        '================STDERR=================\n'
        + 'For 2:\nerror 2',
        'For 3:\nerror 3',
        'For 4:\nerror 4',
        'For 5:\nerror 5',
        ''
      ].join('\n\n'));
      done();
    });
  });

  it('returns an error if an error if command does not exist', function(done){
    exec([
      bad,
      '--exec', 'aaaaaaaaa',
      '--for', '"2 3 4 5"'
    ].join(' '),
    function(err, out, stderr){
      out.should.equal('');
      stderr.should.equal('The --exec arg must refer to a command in your PATH or a file.\n');
      err.code.should.be.above(0);
      done();
    });
  });

  it('prints out env vars', function(done){
    exec([bad, '--exec', printEnv, '--for', '"2 3 4 5"', '--to-env', 'FOO'].join(' '), function(err, out, stderr){
      assert(!err);
      out.should.equal([
        '================STDOUT=================\n'
        + 'For 2:\nenv var Foo: 2',
        'For 3:\nenv var Foo: 3',
        'For 4:\nenv var Foo: 4',
        'For 5:\nenv var Foo: 5',
        ''
      ].join('\n\n'));
      stderr.should.equal('');
      done();
    });
  });

  describe('--argv', function(){
    describe('with --to-env', function(){
      it('passes subject as env var but not as argv', function(done){
        exec([
          bad,
          '--exec', printArgvWithEnv,
          '--for', '3',
          '--argv', '"1 2"',
          '--to-env', 'FOO'
        ].join(' '),
        function(err, out, stderr){
          assert(!err);
          out.should.equal('');
          stderr.should.equal('');
          done();
        });
      });
    });

    describe('without --to-env', function(){
      it('passes subject as last element in argv', function(done){
        exec([
          bad,
          '--exec', printArgvWithoutEnv,
          '--for', '3',
          '--argv', '"1 2"'
        ].join(' '),
        function(err, out, stderr){
          assert(!err);
          out.should.equal('');
          stderr.should.equal('');
          done();
        });
      });
    });
  });

  describe('--show-time', function(){
    it('outputs the time of each task', function(done){
      exec([
        bad,
        '--show-time',
        '--exec echo',
        '--for', '"3 4"'
      ].join(' '),function(err, out, stderr){
        assert(!err);
        out.should.match(/==============TIME\sSTATS===============\nFor\s3:\n\s\s\d+ms\nFor\s4:\n\s\s\d+ms\nTotal\sTime:\n\s\s\d+ms\n================STDOUT=================\nFor\s3:\n3\n\nFor\s4:\n4\n\n/);
        stderr.should.equal('');
        assert(!stderr);
        done();
      });

    });
  });

  describe('--debug', function(){
    it('outputs all the arguments', function(done){
      exec([
        bad,
        '--debug',
        '--silent',
        '--to-env', 'FOO',
        '--argv', '"boo foo doo"',
        '--exec', printSubject,
        '--for', '"3 4"',
        '--debug'
      ].join(' '),function(err, out, stderr){
        assert(!err);
        out.should.equal([
          '=================DEBUG=================\n'
          + 'Debug info: ',
          '--silent: true',
          '--to-env: FOO',
          '--argv: boo,foo,doo',
          '--exec: '+printSubject,
          '--for: 3 4',
          '================STDOUT=================',
          'For 3:\nboo\n',
          'For 4:\nboo\n',
          ''
        ].join('\n'));
        assert(!stderr);
        done();
      });
    });
  });

  describe('--to-env', function(){
    describe('with multiple mapping', function(){
      it('maps with one to one', function(done){
        exec([
          bad,
          '--to-env', '"FOO, BOO"',
          '--exec', multipleMapping,
          '--for', '"3, 4"'
        ].join(' '),function(err, out, stderr){
          assert(!err);
          out.should.equal([
            '================STDOUT=================',
            'For 3:\n3\n',
            'For 4:\n4\n',
            ''
          ].join('\n'));
          assert(!stderr);
          done();
        });
      });

      it('allows for more subjects than maps', function(done){
        exec([
          bad,
          '--to-env', '"FOO, BOO"',
          '--exec', multipleMapping,
          '--for', '"3 2 5 6, 4 7"'
        ].join(' '),function(err, out, stderr){
          assert(!err);
          out.should.equal([
            '================STDOUT=================',
            'For 3:\n3\n',
            'For 2:\n2\n',
            'For 5:\n5\n',
            'For 6:\n6\n',
            'For 4:\n4\n',
            'For 7:\n7\n',
            ''
          ].join('\n'));
          assert(!stderr);
          done();
        });
      });
    });
  });
});
