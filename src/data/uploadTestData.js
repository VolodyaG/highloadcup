'use strict';

const StreamZip = require('node-stream-zip');
const esClient = require('./esClient');
const esIndices = require('./esIndices');

const testDataFolder = process.env.NODE_ENV === 'production' ?
    '/tmp/data' : '/home/volodya/projects/highloadcup/test_data/data';

const dateStarted = new Date();

const zip = new StreamZip({
    file: testDataFolder + '/data.zip',
    storeEntries: true,
    skipEntryNameValidation: false,
});

zip.on('ready', async () => {
    // await esIndices.deleteIndex();
    await esIndices.createIndex();

    console.log('Entries read: ' + zip.entriesCount);

    for (const entry of Object.values(zip.entries())) {
        const accounts = JSON.parse(zip.entryDataSync(entry.name)).accounts;

        const chunks = splitArrayIntoChunks(accounts, 2000);

        const promises = [];
        for (let chunk of chunks) {
            promises.push(bulkCreate(chunk));
        }

        await Promise.all(promises);

        console.log(accounts.length);
    }

    console.log(((new Date().getTime() - dateStarted.getTime()) / 1000) + ' seconds');
    zip.close();
});

zip.on('error', function (err) {
    console.error('ERROR: ' + err);
});


function bulkCreate(data) {
    const bulkPayload = [];

    data.forEach(account => {
       bulkPayload.push({ index:  { _index: 'accounts', _type: 'account', _id: account.id } });
       bulkPayload.push(createSource(account));
    });

    return esClient.bulk({
        body: bulkPayload,
    }).then(response => {
        if (response.errors) {
            console.error(response);
        }
    });
}

function splitArrayIntoChunks(arr, len) {
    const chunks = [], n = arr.length;
    let i = 0;

    while (i < n) {
        chunks.push(arr.slice(i, i += len));
    }

    return chunks;
}

function createSource(account) {
    const source = account;

    source.domain = account.email.slice(account.email.indexOf('@') + 1);
    source.phoneCode = account.phone && account.phone.slice(account.phone.indexOf('(') + 1, account.phone.indexOf(')'));
    source.birthYear = account.birth && new Date(account.birth * 1000).getUTCFullYear();
    source.likedPeople = account.likes && account.likes.map(like => like.id);
    source.isPremium = account.premium && new Date(account.premium.finish * 1000) > new Date(); // ToDo UTC

    return source;

}