import React from 'react';
import './App.css';
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

export default class App extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      meeting: 'None',
      attendee: 'None',
      session: ''
    };
    this.webcamRef = React.createRef();
  }


  getConfigs = () => {
    let meetData;
    axios.get('http://localhost:4000/dev/').then(res => {
      meetData = JSON.parse(res.data.body);
      console.log(meetData);
      this.setState({
        meeting: meetData.meeting,
        attendee: meetData.attendee
      })
    });
  }

  connectToChimeMeeting = () => {
    const meetingConfig = new MeetingSessionConfiguration(this.state.meeting, this.state.attendee)
    const meetingSession = new DefaultMeetingSession(
      meetingConfig,
      logger,
      deviceController
    )

    // TODO --- configure other stuff for the meeting

    console.log('Starting the Chime meeting!')
    meetingSession.audioVideo.start()

    this.setState({
      session: meetingSession
    })
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

  displaySharedVideoContent = (session) => {
    const observer = {
      // :: a tile represents a single instance of shared video content
      videoTileDidUpdate: tile => {
        console.log('Received content with ID:', tile.tileId)

        // :: TODO: get a video element specifically for this tile
        const videoElement = document.getElementById('my-video-element')
        session.audioVideo.bindVideoElement(tile.tileId, videoElement)
      }
    }
    session.audioVideo.addObserver(observer);
  }

  render() {
    return (
      <div>
        <h1> CODA CHIME POC </h1>
        <Webcam ref={this.webcamRef} /> <br />
        <input type='button' onClick={() => this.getConfigs()} style={{ backgroundColor: 'chocolate', color: 'white' }} value='Load confs' />
        <input type='button' onClick={() => this.connectToChimeMeeting()} style={{ backgroundColor: 'chocolate', color: 'white' }} value='Connect chime' />
        <input type='button' onClick={() => this.displaySharedVideoContent(this.state.session)}  style={{ backgroundColor: 'chocolate', color: 'white' }} value='Make streamer ready' />
        <input type='button' onClick={() => this.broadcastVideo(this.state.session, this.webcamRef.current.stream)}  style={{ backgroundColor: 'violet', color: 'white' }} value='Start streaming' />
        <video id="my-video-element"></video>
      </div>
    )
  }
}
