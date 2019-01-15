#!/usr/bin/env bash

bash /usr/local/bin/docker-entrypoint.sh elasticsearch -d

echo 'Waiting for elastic to start'
while ! nc -z 127.0.0.1 9200; do
  sleep 0.1
done

echo 'Elastic is started'


node src/data/uploadTestData.js

echo 'Data is uploaded. Starting'

node src/server.js

