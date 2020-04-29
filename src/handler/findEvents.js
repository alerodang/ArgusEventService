'use strict';

const AWS = require('aws-sdk');
const jwt = require('jsonwebtoken');

const s3 = new AWS.S3();
const bucket = process.env.APP_BUCKET;

module.exports.handler = async (event) => {

    const {continuation_token: continuationToken, max_keys: maxKeys, day, minute, Authorization: token, producer} = event.headers;

    const decodedToken = jwt.decode(token);
    const account = decodedToken["email"];

    let prefix = 'events' + '/' + account + '/';

    if (producer) {
        prefix = prefix + producer + '/';
        if (day && minute) {
            prefix += day + '/';
            prefix += minute;
        } else if (day) {
            prefix += day + '/';
        }
    }

    const listParams = {
        Bucket: bucket,
        Prefix: prefix,
    };

    if (maxKeys) {
        listParams['MaxKeys'] = maxKeys;
    }

    if (continuationToken) {
        listParams['ContinuationToken'] = continuationToken;
    }

    console.log(listParams);

    const s3Response = await s3.listObjectsV2(listParams).promise();

    const events = s3Response["Contents"];
    const nextContinuationToken = s3Response["NextContinuationToken"];
    return {
        statusCode: 200,
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            objects: events,
            nextContinuationToken: nextContinuationToken
        })
    };
};