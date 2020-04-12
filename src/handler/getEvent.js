'use strict';

const AWS = require('aws-sdk');

const s3 = new AWS.S3();
const bucket = process.env.APP_BUCKET;

module.exports.handler = async (event) => {

    const {objectKey} = event.headers;

    const s3Response = await s3.getObject({
        Bucket: bucket,
        Key: objectKey
    }).promise();

    const imageUrl = await s3.getSignedUrl('getObject', {
        Bucket: bucket,
        Key: objectKey.replace('events/', 'captures/').replace('.json', '.jpg'),
        Expires: 180
    });

    const eventData = JSON.parse(s3Response.Body.toString());
    const name = eventData["Item"]["Name"];
    const splitObjectKey = objectKey.split('/');
    const producer = splitObjectKey[2];
    const date = splitObjectKey[3] + splitObjectKey[4] + splitObjectKey[5].split('.')[0];
    return {
        statusCode: 200,
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
            "event": {
                "imageUrl": imageUrl,
                "producer": producer,
                "date": date,
                "recognition": {
                    "name": name
                }
            }
        })
    }
}