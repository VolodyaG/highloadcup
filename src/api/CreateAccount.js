'use strict';

const esClient = require('../data/esClient');

module.exports = async (fastify, options) => {
    fastify.post('/accounts/new', async (request, reply) => {
        return { hello: 'world' }
    })
};