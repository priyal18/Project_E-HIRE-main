import React, {useRef, useEffect} from "react";
import { useParams } from "react-router-dom";
import io from "socket.io-client";
import Peer from "peerjs";
import "../css/Video.css";



var ip = '127.0.0.1:5000';
let peers = {};
let myVideoStream;


function Video(){
    const { id: ROOM_ID } = useParams();
    let socket = useRef();
    const userData = {};

    console.log(socket);
    console.log(ROOM_ID);

    useEffect(() => {

        //Initializing socket
        socket.current = io.connect('https://salty-harbor-48635.herokuapp.com/');
        console.log(socket.current);
        const videoGrid = document.getElementById('video-grid');
        const myVideo = document.createElement('video');
        myVideo.muted = true;

        //Initialising Peer
        var peer = new Peer(undefined, {
            path: '/peerjs',
            host: '/',
            port: '443',
            secure:true,
        });

        //Getting User Name
        const user = prompt("Enter your name");
        console.log(user);

        //Initialising Socket Events
        navigator.mediaDevices.getUserMedia({
            video:true,
            audio:true
        }).then(stream => {
            myVideoStream = stream;
            addVideoStream(myVideo,stream);
        
            peer.on('call' , call => {
                call.answer(stream);
                const video = document.createElement('video');
                call.on('stream', userVideoStream => {
                    addVideoStream(video, userVideoStream);
                })
            })
        
            socket.current.on('user-connected',userId => {
                connectToNewUser(userId,stream);
            })
        })

        

        peer.on('open' , id => {
            socket.current.emit('join-room',ROOM_ID, id, user);
        })
        
        

        const connectToNewUser = (userId,stream) => {
            const call = peer.call(userId,stream)
            const video = document.createElement('video')
            call.on('stream' , userVideoStream => {
                addVideoStream(video, userVideoStream)
            })
        }
        
        const addVideoStream = (video,stream) => {
            video.srcObject = stream;
            video.addEventListener('loadedmetadata',() => {
                video.play();
            })
            videoGrid.append(video);
        }  
    })


    const muteUnmute = () => {
        const enabled = myVideoStream.getAudioTracks()[0].enabled;
        if(enabled) {
            myVideoStream.getAudioTracks()[0].enabled = false;
            setUnmuteButton();
        } else {
            setMuteButton();
            myVideoStream.getAudioTracks()[0].enabled = true;
        }
    }

    const setMuteButton = () => {
        const html = `<i className="fas fa-microphone"></i>
        <span>Mute<span>`

        document.querySelector('.main__mute_button').innerHTML = html;
    }

    const setUnmuteButton = () => {
        const html = `<i className="unmute fas fa-microphone-slash"></i>
        <span>Unmute<span>`

        document.querySelector('.main__mute_button').innerHTML = html;
    }


    const playStop = () => {
        let enabled = myVideoStream.getVideoTracks()[0].enabled;
        if(enabled){
            myVideoStream.getVideoTracks()[0].enabled = false;
            setPlayVideo();
        } else {
            setStopVideo();
            myVideoStream.getVideoTracks()[0].enabled = true;
        }
    }

    const setStopVideo = () => {
        const html = `<i className="fas fa-video"></i>
        <span>Stop Video</span>`

        document.querySelector('.main__video_button').innerHTML = html;
    }

    const setPlayVideo = () => {
        const html = `<i className="stop fas fa-video-slash"></i>
        <span>Turn On Video</span>`

        document.querySelector('.main__video_button').innerHTML = html;
    }

    const invite = () => {
        prompt(
        "Copy this link and send it to person you want to meet with",
        window.location.href
        );
    }



    return(
        
        <div className = "main">
            <div className = "main__left">
                <div className = "main__videos">
                    <div id="video-grid">  
                    </div>
                </div>

                <div className="main__controls">
                    <div className="main__controls__block">
                        <div onClick = {muteUnmute} className="main__controls__button main__mute_button">
                            <i className="fas fa-microphone"></i>
                            <span>Mute</span>
                        </div>
                        <div onClick = {playStop} className="main__controls__button main__video_button">
                            <i className="fas fa-video"></i>
                            <span>Stop Video</span>
                        </div>
                    </div>
                    <div className="main__controls__block">
                        <div onClick = {invite} className="main__controls__button inviteButton">
                            <i className="fas fa-user-plus"></i>
                            <span> Invite</span>
                        </div>
                        <div className="main__controls__button">
                            <i className="fas fa-user-friends"></i>
                            <span>Participants</span>
                        </div>
                        <div className="main__controls__button">
                            <i className="fas fa-comment-alt"></i>
                            <span>Chat</span>
                        </div>
                    </div>
                    <div className="main__controls__block">
                        <div className="main__controls__button">
                            <span className="leave_meeting">Leave Meeting</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Video;