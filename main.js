const socket = io('https://stream3008.herokuapp.com/');

$('#div-chat').hide();

// This object will take in an array of XirSys STUN / TURN servers
// and override the original config object
let customConfig;

// Call XirSys ICE servers
$.ajax({
url: "https://service.xirsys.com/ice",
data: {
  ident: "thaisonvnn11",
  secret: "3b9f300c-87f5-11e7-bf7f-7ac1a8e15c37",
  domain: "tsvn11.github.io",
  application: "default",
  room: "default",
  secure: 1
},
success: function (data, status) {
  // data.d is where the iceServers object lives
  customConfig = data.d;
  console.log(customConfig);
},
async: false
});

socket.on('DANH_SACH_ONLINE', arrUserInfo => {
    $('#div-chat').show();
    $('#div-dangky').hide();

    arrUserInfo.forEach(user => {
        const { ten, peerId } = user;
        $('#ulUser').append(`<li id="${peerId}">${ten}</li>`);
    });

    socket.on('CO_NGUOI_DUNG_MOI', user => {
        const { ten, peerId } = user;
        $('#ulUser').append(`<li id="${peerId}">${ten}</li>`);
    });

    socket.on('NGUOI_DUNG_NGAT_KET_NOI', peerId => {
        $(`#${peerId}`).remove();
    });
});

socket.on('DANG_KY_THAT_BAI', () => alert('Vui long chon username khac!'));

function openStream() {
    const config = { audio: false, video: true };
    return navigator.mediaDevices.getUserMedia(config);
}

function playStream(idVideoTag, stream) {
    const video = document.getElementById(idVideoTag);
    video.srcObject = stream;
    video.play();
}

//openStream()
//.then(stream => playStream('localStream', stream));

var peer = new Peer({
    key: 'peerjs',
    host: 'mypeer3008.herokuapp.com',
    secure: true,
    port: 443,
    config: customConfig 
});

peer.on('open', id => {
    $('#my-peer').append(id);
    $('#btnSignUp').click(() => {
        const username = $('#txtUserName').val();
        socket.emit('NGUOI_DUNG_DANG_KY', { ten: username, peerId: id });
    });
});

//Caller
$('#btnCall').click(() => {
    const id = $('#remoteId').val();
    openStream()
    .then(stream => {
        playStream('localStream', stream);
        const call = peer.call(id, stream);
        call.on('stream', remoteStream => playStream('remoteStream', remoteStream));
    });
});

//Callee
peer.on('call', call => {
    openStream()
    .then(stream => {
        call.answer(stream);
        playStream('localStream', stream);
        call.on('stream', remoteStream => playStream('remoteStream', remoteStream));
    });
});

$('#ulUser').on('click', 'li', function() {
    const id = $(this).attr(`id`);
    openStream()
    .then(stream => {
        playStream('localStream', stream);
        const call = peer.call(id, stream);
        call.on('stream', remoteStream => playStream('remoteStream', remoteStream));
    });
});