import React, {useRef, useEffect} from "react";
import { useParams } from "react-router-dom";
import io from "socket.io-client";
import Peer from "peerjs";
import "../css/Video.css";



let ip = '127.0.0.1:5000';
let peers = {};
let myVideoStream;


function Video(){
    const { id: ROOM_ID } = useParams();
    let socket = useRef();
    const VideoContainer = {};

    console.log(socket);
    console.log(ROOM_ID);

    useEffect(() => {

        //Initializing socket
        socket.current = io.connect(process.env.PORT||ip, {
            secure: true, 
            reconnection: true, 
            rejectUnauthorized: false,
            reconnectionAttempts: 10
            });
        console.log(socket.current);

        //Initialising Peer
        var peer = new Peer(undefined, {
            path: '/peerjs',
            host: '/',
            port: '443'
        });

        //Getting User Name
        const user = prompt("Enter your name");
        console.log(user);

        //Initialising Socket Events

        socket.current.on('connect', () => {
            console.log('socket connected');
        });
        socket.current.on('user-disconnected', (userID) => {

            console.log('user disconnected-- closing peers', userID);
            peers[userID] && peers[userID].close();
            console.log('PEERS');
            removeVideo(userID);
        });
        socket.current.on('disconnect', () => {
            console.log('socket disconnected --');
        });
        socket.current.on('error', (err) => {
            console.log('socket error --', err);
        });


        //Getting Permissions for Video adn Audio and Connecting 
        navigator.mediaDevices.getUserMedia({
            video:true,
            audio:true
        }).then(stream => {
            myVideoStream = stream;
            createVideo({ id: socket.current.myID, stream });


            peer.on('call' , call => {
                call.answer(stream);
                console.log("peers listener set");
                call.on('stream', (userVideoStream) => {
                    console.log("call.metadata",call.metadata.id);
                    console.log('user Video Stream data',userVideoStream);
                    createVideo({id:call.metadata.id,stream:userVideoStream });
                })
                call.on('close',() => {
                    console.log('closing peers listeners',call.metadata.id);
                    removeVideo(call.metadata.id);
                })
                call.on('error' , () => {
                    console.log('error ....peers listener',call.metadata.id);
                    removeVideo(call.metadata.id);
                })
                peers[call.metadata.id] = call;
            });

            socket.current.on('user-connected',userData => {
                console.log("connecting new user");
                connectToNewUser(userData,stream);
            })
        })

        peer.on('open' , id => {
            socket.current.myID = id;
            const userData = {
                    userID : id, ROOM_ID
             }
             console.log("userData",userData);
            socket.current.emit('join-room',userData);
        })

        const connectToNewUser = (userData,stream) => {
            const {userID,ROOM_ID} = userData;
            const call = peer.call(userID,stream ,{metadata: { id:socket.current.myID }});
            console.log("peer.call made for new user");

            call.on('stream' , (userVideoStream) => {
                console.log("call.onstream for new user done");
                createVideo({ id:userData, stream:userVideoStream, userData });
            })
            call.on('close', () => {
                console.log('closing new user', userData);
                removeVideo(userID);
            });
            call.on('error', () => {
                console.log('peer error ------')
                removeVideo(userID);
            })

            peers[userID] = call;
        }
        
        const createVideo = (createObj) => {

            console.log("CREATE OBJECT",createObj.id);

            if(!VideoContainer[createObj.id]){
                VideoContainer[createObj.id] = {
                    ...createObj,
                };
                console.log("VC",VideoContainer);

                const videoGrid = document.getElementById('video-grid');
                const innerVideoDiv = document.createElement('div');
                const myVideo = document.createElement('video');

                
                   
                

                console.log(VideoContainer[createObj.id].stream)
                myVideo.srcObject = VideoContainer[createObj.id].stream;
                myVideo.id = createObj.id;
                if(socket.current.myID === createObj.id)
                {
                    myVideo.muted = true;
                }
                console.log(user);
                myVideo.addEventListener('loadedmetadata',() => {
                    myVideo.play();
                })

                innerVideoDiv.appendChild(myVideo);
                videoGrid.append(innerVideoDiv);

            }
            else {
                 document.getElementById(createObj.id).srcObject = createObj.stream;
             }
        }

        const removeVideo = (id) => {
            console.log("ID",id);
            
            delete VideoContainer[id];
            console.log("inside remove video");
            const video = document.getElementById(id);
            if(video) video.remove();
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