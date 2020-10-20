'use strict';

const AWS = require('aws-sdk');

const s3 = new AWS.S3();
const bucket = process.env.APP_BUCKET;

module.exports.handler = async (event) => {

    const {object_key: objectKey} = event.headers;

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
    const splitObjectKey = objectKey.split('/');
    const producer = splitObjectKey[2];
    const date = splitObjectKey[3] + splitObjectKey[4] + splitObjectKey[5].split('.')[0];
    const formattedDate = date.substr(0, 4) + '/' +
        date.substring(4, 6) + '/' +
        date.substring(6, 8) + ' ' +
        date.substring(8, 10) + ':' +
        date.substring(10, 12) + ':' +
        date.substring(12, 14);
    if (Object.keys(eventData).length === 0) {
        return {
            statusCode: 200,
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                object: {
                    imageUrl: imageUrl,
                    producer: producer,
                    date: formattedDate,
                    recognition: {
                        success: false
                    },
                    objectKey: objectKey,
                }
            })
        }
    } else {
        const name = eventData["Item"]["name"];
        return {
            statusCode: 200,
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                object: {
                    imageUrl: imageUrl,
                    producer: producer,
                    date: formattedDate,
                    recognition: {
                        name: name,
                        success: true
                    },
                    objectKey: objectKey,
                }
            })
        }
    }
}