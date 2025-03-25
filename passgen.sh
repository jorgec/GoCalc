#!/usr/bin/env bash

# Usage: ./passgen.sh <password>

if [ -z "$1" ]; then
  echo "Usage: $0 <password>"
  exit 1
fi

# Hash the supplied parameter using SHA-256, then store the result in "password" file.
echo -n "$1" | sha256sum | awk '{ print $1 }' > password
cp password "build/bin/GoCalc.app/Contents/MacOS/"
echo "Hash saved to 'password' file."