#!/usr/bin/env bash

DEBUG=falcon pm2 start example/server.js --watch --no-daemon --node-args --inspect=9229