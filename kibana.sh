#!/usr/bin/env bash

docker run -d -p 5601:5601 --name kibana --link elastic:elastic \
    -e "ELASTICSEARCH_URL=http://elastic:9200" docker.elastic.co/kibana/kibana:6.5.4

