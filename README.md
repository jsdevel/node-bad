bad
======================
[![Build Status](https://travis-ci.org/jsdevel/node-bad.png)](https://travis-ci.org/jsdevel/node-bad)

`bad` is a command line tool that allows you to execute a command multiple times
concurrently for a given number of subjects.

`bad` is general enough for just about anything that requires parallel execution,
and it's also *bad* enough to accomplish it with ease!

##Usage
````
Usage: bad --exec my-command --for "1 2 3 4"

Options:

  -h, --help          output usage information
  -V, --version       output the version number
  --verbose           show the output verbosley.
  -s, --silent        show as little as possible.
  --exec <command>    the command to run.  This is passed directly to spawn.
  --for <subjects>    a whitespace separated list of subjects.
                      Each subject is appended to argv except when --to-env is given.
  --argv [args]       a whitespace separated list of arguments to pass to the command.
  --to-env [varname]  an env var representing the subject for the command.

````

##Example
This would silently curn the given urls concurrently:
````
bad --exec curl --argv '-s' --for "google.com linkedin.com npmjs.org"
````
