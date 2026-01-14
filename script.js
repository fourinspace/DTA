const socket = io('YOUR_SERVER_URL'); // Replace with your hosted server URL
const localVideo = document.getElementById('localVideo');
const remoteVideo = document.getElementById('remoteVideo');

let localStream;
let peerConnection;

const config = { iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] };

async function start() {
    // 1. Get Camera/Mic
    localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    localVideo.srcObject = localStream;

    // 2. Setup Peer Connection
    peerConnection = new RTCPeerConnection(config);
    localStream.getTracks().forEach(track => peerConnection.addTrack(track, localStream));

    peerConnection.ontrack = (event) => {
        remoteVideo.srcObject = event.streams[0];
    };

    peerConnection.onicecandidate = (event) => {
        if (event.candidate) socket.emit('candidate', event.candidate);
    };

    // 3. Signaling Handlers
    socket.on('offer', async (offer) => {
        await peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
        const answer = await peerConnection.createAnswer();
        await peerConnection.setLocalDescription(answer);
        socket.emit('answer', answer);
    });

    socket.on('answer', async (answer) => {
        await peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
    });

    socket.on('candidate', async (candidate) => {
        await peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
    });
}

document.getElementById('startButton').onclick = async () => {
    await start();
    const offer = await peerConnection.createOffer();
    await peerConnection.setLocalDescription(offer);
    socket.emit('offer', offer);
};
