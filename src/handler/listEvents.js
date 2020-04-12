'use strict';

const AWS = require('aws-sdk');
const jwt = require('jsonwebtoken');

const s3 = new AWS.S3();
const bucket = process.env.APP_BUCKET;

module.exports.handler = async (event) => {

    const {continuationToken, maxKeys, day, minute, Authorization: token, producer} = event.headers;

    const decodedToken = jwt.decode(token);
    const account = decodedToken["email"];

    let prefix = 'events' + '/' + account + '/' + producer + '/';
    if (day && minute) {
        prefix += day + '/';
        prefix += minute;
    } else if (day) {
        prefix += day + '/';
    }

    const s3Response = await s3.listObjectsV2({
        Bucket: bucket,
        MaxKeys: maxKeys,
        Prefix: prefix,
        ContinuationToken: continuationToken
    }).promise();

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