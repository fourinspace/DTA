const socket = io('https://dta-2gfa.onrender.com');
const localVideo = document.getElementById('localVideo');
const remoteVideo = document.getElementById('remoteVideo');

let localStream;
let peerConnection;

const config = {
    iceServers: [{ urls: 'stun:stun1.l.google.com:19302' }, { urls: 'stun:stun2.l.google.com:19302' }]
};

// 1. Immediately get camera on page load so it's ready
(async () => {
    localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    localVideo.srcObject = localStream;
})();

async function setupPeer(isCaller) {
    peerConnection = new RTCPeerConnection(config);
    localStream.getTracks().forEach(track => peerConnection.addTrack(track, localStream));

    peerConnection.ontrack = (e) => remoteVideo.srcObject = e.streams[0];
    peerConnection.onicecandidate = (e) => e.candidate && socket.emit('candidate', e.candidate);

    if (isCaller) {
        const offer = await peerConnection.createOffer();
        await peerConnection.setLocalDescription(offer);
        socket.emit('offer', offer);
    }
}

// Click to Call
document.getElementById('startButton').onclick = () => setupPeer(true);

// Auto-Answer when the other person calls
socket.on('offer', async (offer) => {
    if (!peerConnection) await setupPeer(false);
    await peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
    const answer = await peerConnection.createAnswer();
    await peerConnection.setLocalDescription(answer);
    socket.emit('answer', answer);
});

socket.on('answer', (answer) => peerConnection.setRemoteDescription(new RTCSessionDescription(answer)));
socket.on('candidate', (cand) => peerConnection.addIceCandidate(new RTCIceCandidate(cand)));
