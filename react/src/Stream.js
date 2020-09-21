import React from 'react';
import {
  ConsoleLogger,
  DefaultDeviceController,
  DefaultMeetingSession,
  LogLevel,
  MeetingSessionConfiguration,
} from 'amazon-chime-sdk-js';
import axios from 'axios';
import Webcam from "react-webcam";
const logger = new ConsoleLogger('Chime Logs', LogLevel.INFO)
const deviceController = new DefaultDeviceController(logger)
export default class Stream extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      meeting: 'None',
      attendee: 'None',
      session: '',
    };
    this.webcamRef = React.createRef();
  }
  getConfigs = async () => {
    let meetData;
    await axios.get('https://8cbfvjuwp2.execute-api.us-east-1.amazonaws.com/dev/user2').then(res => {
      meetData = res.data;
      console.log(meetData);
      this.setState({
        meeting: meetData.meetingResponse,
        attendee: meetData.attendeeResponse
      })
    });
  }
  connectToChimeMeeting = async () => {
    const meetingConfig = new MeetingSessionConfiguration(this.state.meeting, this.state.attendee)
    const meetingSession = new DefaultMeetingSession(
      meetingConfig,
      logger,
      deviceController
    )
    // TODO --- configure other stuff for the meeting
    console.log('Starting the Chime meeting!')
    meetingSession.audioVideo.start()
    await this.setState({
      session: meetingSession
    })
  }
  /** @param {ChimeMeetingSession} session */
  setMeetingAudioInputDevice = async (session) => {
    // :: This will select the default audio input device on your machine, generally.
    //
    // :: You will probably want to let the user select
    //    which device they specifically want to use.
    const availableAudioInputDevices = await session.audioVideo.listAudioInputDevices()
    const deviceId = availableAudioInputDevices[0].deviceId
    await session.audioVideo.chooseAudioInputDevice(deviceId)
  }
  /**
   * @param {ChimeMeetingSession} session
   * @param {MediaStream} videoStream
   */
  broadcastVideo = (session, videoStream) => {
    session.audioVideo.startContentShare(videoStream).then(res => {
      console.log(res);
    })
  }
  render() {
    const videoConstraints = {
      width: 1280,
      height: 720,
      facingMode: "user"
    };
    const audio = true;
    return (
      <div>
        <h1> CODA CHIME POC </h1>
        <Webcam ref={this.webcamRef} videoConstraints={videoConstraints} audio={audio} /> <br />
        <input type='button' onClick={() => this.getConfigs()} style={{ backgroundColor: 'chocolate', color: 'white' }} value='Load confs' />
        <input type='button' onClick={() => this.connectToChimeMeeting()} style={{ backgroundColor: 'chocolate', color: 'white' }} value='Connect chime' />
        <input type='button' onClick={() => this.setMeetingAudioInputDevice(this.state.session)} style={{ backgroundColor: 'chocolate', color: 'white' }} value='Connect audio' />
        <input type='button' onClick={() => this.broadcastVideo(this.state.session, this.webcamRef.current.stream)} style={{ backgroundColor: 'violet', color: 'white' }} value='Start streaming' />
      </div>
    )
  }
}