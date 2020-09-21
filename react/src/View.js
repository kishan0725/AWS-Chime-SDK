import React from 'react';
import {
    ConsoleLogger,
    DefaultDeviceController,
    DefaultMeetingSession,
    LogLevel,
    MeetingSessionConfiguration,
} from 'amazon-chime-sdk-js';
import axios from 'axios';
const logger = new ConsoleLogger('Chime Logs', LogLevel.INFO)
const deviceController = new DefaultDeviceController(logger)
export default class View extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            meeting: 'None',
            attendee: 'None',
            session: '',
            isFullscreen: 'NO'
        };
    }
    componentDidMount() {
        this.getReady();
    }
    getConfigs = async () => {
        let meetData;
        await axios.get('https://8cbfvjuwp2.execute-api.us-east-1.amazonaws.com/dev/user5').then(res => {
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
        await meetingSession.audioVideo.start()
        this.setState({
            session: meetingSession
        })
    }
    displaySharedVideoContent = async (session) => {
        const observer = {
            // :: a tile represents a single instance of shared video content
            videoTileDidUpdate: tile => {
                console.log('Received content with ID:', tile.tileId)
                // :: TODO: get a video element specifically for this tile
                const videoElement = document.getElementById('my-video-element')
                session.audioVideo.bindVideoElement(tile.tileId, videoElement);
            }
        }
       session.audioVideo.addObserver(observer);
    }
    /** @param {ChimeMeetingSession} session */
  bindMeetingAudioOutput = async(session) => {
    const audioElement = document.getElementById('my-audio-element')
    session.audioVideo.bindAudioElement(audioElement);
    const observer = {
        audioVideoDidStart: () => {
          console.log('Started');
        }
      };
      session.audioVideo.addObserver(observer);
  }
    getReady = async () => {
        await this.getConfigs()
        await this.connectToChimeMeeting()
        await this.displaySharedVideoContent(this.state.session)
        await this.bindMeetingAudioOutput(this.state.session)
    }
    render() {
        return (
            <div style={{ background: '#000', display: 'flex', width: '100vw', height: '100vh'}}>
                <audio id="my-audio-element"></audio>
                <video style={{width: '100%', height: '100%'}} id="my-video-element"></video>
            </div>
        )
    }
}