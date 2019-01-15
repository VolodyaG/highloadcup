FROM docker.elastic.co/elasticsearch/elasticsearch:6.5.4

ENV discovery.type single-node

# INSTALL NODE
ENV NVM_VERSION v0.33.11
ENV NODE_VERSION 10.15.0
ENV NVM_DIR /usr/local/nvm
RUN mkdir $NVM_DIR
RUN curl -o- https://raw.githubusercontent.com/creationix/nvm/$NVM_VERSION/install.sh | bash

ENV NODE_PATH $NVM_DIR/v$NODE_VERSION/lib/node_modules
ENV PATH $NVM_DIR/versions/node/v$NODE_VERSION/bin:$PATH

RUN echo "source $NVM_DIR/nvm.sh && \
    nvm install $NODE_VERSION && \
    nvm alias default $NODE_VERSION && \
    nvm use default" | bash

# Application

ENV NODE_ENV production

RUN mkdir /var/app
WORKDIR /var/app

COPY src ./src
COPY package.json .
RUN npm install

COPY docker/start.sh .

CMD ./start.sh