'use strict';
const AWS = require('aws-sdk');
const { v4: uuid } = require('uuid');

const chime = new AWS.Chime({ region: 'us-east-1' }) // :: has to be us-east-1 for now
chime.endpoint = new AWS.Endpoint('https://service.chime.aws.amazon.com/console');

module.exports.hello = async () => {

  const meetingResponse = await chime.createMeeting({
    ClientRequestToken: uuid(),
    MediaRegion: 'us-west-2' // Specify the region in which to create the meeting.
  }).promise();
  
  const attendeeResponse = await chime.createAttendee({
    MeetingId: meetingResponse.Meeting.MeetingId,
    ExternalUserId: uuid() // Link the attendee to an identity managed by your application.
  }).promise();

  const payload = { meetingResponse, attendeeResponse }

  return {
    statusCode: 200,
    body: JSON.stringify(payload)
  };

};
