#!/usr/bin/env bash

docker run -it -p 8080:80 \
  -v /home/volodya/projects/highloadcup/test_data/data:/tmp/data:ro \
   highload_cup