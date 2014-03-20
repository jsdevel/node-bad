bad
======================
[![Build Status](https://travis-ci.org/jsdevel/node-bad.png)](https://travis-ci.org/jsdevel/node-bad)

`bad` is a CLI tool that allows you to execute a script multiple times concurrently
for a given number of subjects.

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
