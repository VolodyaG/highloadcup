'use strict';

const fs = require('fs');
const esClient = require('./esClient');

async function createIndex() {
    const body = fs.readFileSync(__dirname + '/mappings.json', 'utf8');
    return esClient.indices.create({
        index: 'accounts',
        body: body,
    });
}

async function deleteIndex() {
    return esClient.indices.delete({
        index: 'accounts',
    });
}

module.exports = {
    createIndex, deleteIndex,
};