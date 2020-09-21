import React from 'react';
import ReactHlsPlayer from 'react-hls-player';

export default class IVSLiveStream extends React.Component {

    render() {
        const liveStreamStyle = {
            background: '#000', 
            width: '100vw', 
            height: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
        }

        return (
            <div style={liveStreamStyle}>
                <ReactHlsPlayer
                    url='https://3bbd23971750.us-east-1.playback.live-video.net/api/video/v1/us-east-1.427956178179.channel.HO6A8jIjfHWt.m3u8'
                    autoplay={false}
                    controls={true}
                    width="70%"
                    height="80%"
                />
            </div>
        )
    }
}
