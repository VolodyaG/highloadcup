'use strict';

const esClient = require('../data/esClient');

module.exports = async (fastify, options) => {
    fastify.post('/accounts/:id', async (request, reply) => {
        return { hello: 'world' }
    })
};