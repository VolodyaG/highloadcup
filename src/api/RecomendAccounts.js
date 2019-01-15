'use strict';

const esClient = require('../data/esClient');

module.exports = async (fastify, options) => {
    fastify.get('/accounts/:id/recommend', async (request, reply) => {
        return { hello: 'world' }
    })
};