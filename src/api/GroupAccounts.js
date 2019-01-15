'use strict';

const esClient = require('../data/esClient');

module.exports = async (fastify, options) => {
    fastify.get('/accounts/group', async (request, reply) => {
        return { hello: 'world' }
    })
};