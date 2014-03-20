bad
======================
[![Build Status](https://travis-ci.org/jsdevel/node-bad.png)](https://travis-ci.org/jsdevel/node-bad)

`bad` is a CLI tool that allows you to execute a command multiple times concurrently
for a given number of subjects.

##Usage
````

  Usage: bad --exec my-command --for "1 2 3 4"

    Options:

        -h, --help          output usage information
        -V, --version       output the version number
        --verbose           show the output verbosley.
        -s, --silent        show as little as possible.
        --exec <command>    the command to run.  This is passed directly to spawn.
        --to-env <varname>  an env var representing the subject for the command.
        --for <subjects>    a white space separated list of arguments.
                            Each arg is passed to the command as it's first arg.

````

##Example
````
bad --exec echo --for "1 2 3 4"
````

This would print:
````
1
2
3
4
````
