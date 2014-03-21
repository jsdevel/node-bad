'use strict';

describe('bad', function(){
  var kid = require('kid_process');
  var path = require('path');
  var bad = path.resolve(__dirname, '..', 'bin', 'bad.js');
  var fixtures = path.resolve(__dirname, '..', 'test-fixtures');
  var printSubject = path.resolve(fixtures, 'print-subject.bash');
  var printEnv = path.resolve(fixtures, 'print-env-FOO.bash');
  var writeToStdErr = path.resolve(fixtures, 'write-to-stderr.bash');
  var abnormalExit = path.resolve(fixtures, 'abnormal-exit.bash');

  it('exits normally on normal exit codes', function(done){
    kid.play(bad, ['--exec', printSubject, '--for', '2 3 4 5'])
    .on('terminated', function(code){
      code.should.equal(0);
      done();
    });
  });

  it('exits abnormally on bad exit codes', function(done){
    kid.play(bad, ['--exec', abnormalExit, '--for', '2 3 4 5'])
    .on('terminated', function(code){
      code.should.equal(3);
      done();
    });
  });

  it('exits normally if stderr output exists', function(done){
    kid.play(bad, ['--exec', writeToStdErr, '--for', '2 3 4 5'])
    .on('terminated', function(code){
      code.should.equal(0);
      done();
    });
  });

  it('returns an error if an error if command does not exist', function(done){
    kid.play(bad, ['--exec', 'aaaaaaaaa', '--for', '2 3 4 5'])
    .on('terminated', function(code){
      code.should.be.above(0);
      done();
    });
  });

  it('prints out env vars', function(done){
    var process = kid
    .play(bad, ['--exec', printEnv, '--for', '2 3 4 5', '--to-env', 'FOO'])
    .on('terminated', function(code){
      console.log(Object.prototype.toString.call(process.stdout));
      /*process.stdout.on('data', function(data){
        console.log(data);
      });*/
      done();
    });
  });

});
