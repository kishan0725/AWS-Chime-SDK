import { Chime, config, Endpoint } from 'aws-sdk'
import dotenv from 'dotenv';
dotenv.config()

const http = require('http');

const hostname = '127.0.0.1';
const port = 4000;

const server = http.createServer( async (req, res) => {
  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/plain');
  res.setHeader('Access-Control-Allow-Origin', '*');
  let meetResponse = await handler();
  await res.end( JSON.stringify(meetResponse))
});

server.listen(port, hostname, () => {
  console.log(` at http://${hostname}:${port}/`);
});

export default function hello() {
  return `Running chime server`;
}

config.update({
  accessKeyId: process.env.accessKeyId,
  secretAccessKey: process.env.secretAccessKey,
});

const chime = new Chime({ region: 'us-east-1' })
chime.endpoint = new Endpoint('https://service.chime.aws.amazon.com/console');

/** @returns {ChimeMeetingInstance} */
async function createChimeMeeting() {
  const params = {
    ClientRequestToken: 'some-random-string-of-your-choice',
    MediaRegion: 'us-west-2' // :: where your call is actually hosted
  }
  return await chime.createMeeting(params).promise()
}

/**
 * @param {ChimeMeetingInstance} meetingInstance
 * @returns {ChimeMeetingAttendee}
 */
async function createChimeAttendee(meetingInstance) {

  const params = {
    MeetingId:  meetingInstance.Meeting.MeetingId,
    ExternalUserId: 'unique-user-identifierasdasd'
  }

  return await chime.createAttendee(params).promise()
}

async function handler() {
  const meeting = await createChimeMeeting()
  const attendee = await createChimeAttendee(meeting)

  const payload = { meeting, attendee }

  return {
    statusCode: 200,
    body: JSON.stringify(payload)
  }
}

if (require.main === module) {
  process.stdout.write(hello());
}
