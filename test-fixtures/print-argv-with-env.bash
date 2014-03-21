#!/bin/bash

if [ "$1" == '1' ] && [ "$2" == '2' ] && [ -z "$3" ] && [ "$FOO" == '3' ];then
  exit 0
else
  exit 1
fi
