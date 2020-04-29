'use strict';

const AWS = require('aws-sdk');

const s3 = new AWS.S3();
const bucket = process.env.APP_BUCKET;

module.exports.handler = async (event) => {

    const {object_key: objectKey, expires} = event.headers;

    const imageUrl = await s3.getSignedUrl('getObject', {
        Bucket: bucket,
        Key: objectKey.replace('events/', 'captures/').replace('.json', '.jpg'),
        Expires: parseInt(expires)
    });

    return {
        statusCode: 200,
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
            "imageUrl": imageUrl
        })
    };
};