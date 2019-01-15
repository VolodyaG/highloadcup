'use strict';

// https://highloadcup.ru/media/condition/accounts_rules.html

const fastify = require('fastify')({
    logger: true,
});

fastify.register(require('./api/BulkLikes'));
fastify.register(require('./api/CreateAccount'));
fastify.register(require('./api/FilterAccounts')); // Implemented
fastify.register(require('./api/GroupAccounts'));
fastify.register(require('./api/RecomendAccounts'));
fastify.register(require('./api/SuggestAccounts'));
fastify.register(require('./api/UpdateAccount'));

const port = process.env.NODE_ENV === 'production' ? 80 : 8080;

fastify.listen(port, '0.0.0.0', (err, address) => {
    if (err) {
        fastify.log.error(err);
        process.exit(1);
    }
    fastify.log.info(`server listening on ${address}`)
});