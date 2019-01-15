'use strict';

const esClient = require('../data/esClient');
const esb = require('elastic-builder');

const allowedFieldsToFilter = {
    sex: ['eq'],
    email: ['domain', 'lt', 'gt'],
    status: ['eq', 'neq'],
    fname: ['eq', 'any', 'null'],
    sname: ['eq', 'starts', 'null'],
    phone: ['code', 'null'],
    country: ['eq', 'null'],
    city: ['eq', 'any', 'null'],
    birth: ['lt', 'gt', 'year'],
    interests: ['contains', 'any'],
    likes: ['contains'],
    premium: ['now', 'null'],
};

module.exports = async (fastify, options) => {
    fastify.get('/accounts/filter', async (request, reply) => {
        try {
            const limit = Number.parseFloat(request.query.limit);
            if (!Number.isInteger(limit) || limit < 1) {
                throw 'invalid limit';
            }

            const filterParameters = parseFilterParameters(request.query);
            const results = await search(filterParameters, limit);
            return { accounts: results.hits.hits.map(hit => hit._source) }
        } catch (e) {
            console.log(e);
            reply.code(400).send(e);
        }
    })
};

function parseFilterParameters(query) {
    return Object.keys(query)
        .filter(key => key !== 'query_id' && key !== 'limit')
        .map(key => {
            const filterRules = key.split('_');

            if (filterRules.length != 2) {
                throw 'invalid parameter';
            }

            const field = filterRules[0];
            const predicate = filterRules[1];

            const allowedPredicated = allowedFieldsToFilter[field];

            if (!allowedPredicated || !allowedPredicated.includes(predicate)) {
                throw 'invalid field or predicate';
            }

            return {
                field: field,
                predicate: predicate,
                value: query[key],
            }
        });
}

function search(filterRules, limit) {
    const body = buildSearchQuery(filterRules);
    console.log(JSON.stringify(body));

    const fieldsToReturn = [
        'id', 'email',
        ...filterRules.filter(rule => rule.field !== 'interestss' && rule.field !== 'likes')
            .map(rule => rule.field),
    ];

    console.log(fieldsToReturn);

    return esClient.search({
        index: 'accounts',
        size: limit,
        sort: 'id:desc',
        _sourceInclude: fieldsToReturn,
        body: body,
    });
}

function buildSearchQuery(filters) {
    if (filters.length === 0) {
        return {};
    }

    let boolQuery = esb.boolQuery();

    for (let filter of filters) {
        boolQuery = handlePredicates(filter, boolQuery);
    }

    return esb.requestBodySearch().query(boolQuery).toJSON();
}

function handlePredicates(filter, boolQuery) {
    switch (filter.predicate) {
        case 'eq':
            return boolQuery.filter(esb.termQuery(filter.field, filter.value));
        case 'neq':
            return boolQuery.mustNot(esb.termQuery(filter.field, filter.value));
        case 'domain':
            return boolQuery.filter(esb.termQuery('domain', filter.value));
        case 'lt':
        case 'gt':
            const  field = filter.field === 'email' ? 'email.raw' : filter.field;
            return boolQuery.filter(esb.rangeQuery(field)[filter.predicate](filter.value));
        case 'any':
            const values = filter.value.split(',');
            return boolQuery.filter(esb.termsQuery(filter.field, values));
        case 'starts':
            return boolQuery.filter(esb.prefixQuery(filter.field, filter.value));
        case 'null':
            const existsQuery = esb.existsQuery(filter.field);
            return filter.value === '0' ? boolQuery.filter(existsQuery) : boolQuery.mustNot(existsQuery);
        case 'code':
            return boolQuery.filter(esb.termQuery('phoneCode', filter.value));
        case 'year':
            return boolQuery.filter(esb.termQuery('birthYear', filter.value));
        case 'contains':
            const fieldToFilter = filter.field === 'likes' ? 'likedPeople' : filter.field;
            const valuesToCheck = filter.value.split(',');
            return boolQuery.filter(containsQuery(fieldToFilter, valuesToCheck));
        case 'now':
            return boolQuery.filter(esb.termQuery('isPremium', true));
        default:
            throw 'Invalid predicate';

    }
}

function containsQuery(field, values) {
    return esb.termsSetQuery(field, values).minimumShouldMatchScript({source: `${values.length}`});
}