const socket = io('/')
const videoGrid = document.getElementById('video-grid')
const myPeer = new Peer(undefined, {
    path: 'peerjs',
    host: '/',
    port : '443'
}) 

const user = prompt("Username")
const myVideo = document.createElement('video')
myVideo.muted = true
const peers ={}

let myVideoStream
navigator.mediaDevices.getUserMedia({
    video: true,
    audio: true
}). then(stream =>{
    myVideoStream = stream
    addVideoStream(myVideo , stream)

    myPeer.on('call', call =>{
        call.answer(stream)
        const video = document.createElement('video')
        call.on('stream', userVideoStream => {
            addVideoStream(video, userVideoStream)
        })
    })

    socket.on('user-connected', userId => {
        connectToNewUser(userId , stream)
    })
})


let msg = $('input')
let messages = $('.messages')
$('html').keydown((e) => {
    if(e.which == 13 && msg.val().length !==0){
        console.log(msg.val())
        socket.emit('message', msg.val())
        msg.val('')
    }
})

socket.on('createMessage', (message, userName) =>{
    console.log('this msg comes from server ' + message)
    $('.messages').append(`
    <div class="message">
        <b>
            <i class="far fa-user-circle"></i> 
            <span> ${userName === user ? "me" : userName}</span>
        </b>
        <br>
        <span>${message}</span>
    </div>
    `)
})

socket.on('user-disconnected', userId =>{
    console.log(userId)
    if(peers[userId]) peers[userId].close()
})

myPeer.on('open', id => {
    socket.emit('join-room', ROOM_ID, id, user)
})


function connectToNewUser(userId, stream){
    const call = myPeer.call(userId, stream)
    const video = document.createElement('video')
    call.on('stream' , userVideoStream => {
        addVideoStream(video, userVideoStream)
    })

    call.on('close', () => {
        video.remove()
    })

    peers[userId] = call
}

function addVideoStream(video, stream){
    video.srcObject = stream
    video.addEventListener('loadedmetadata', ()=>  {
        video.play()
    })
    videoGrid.append(video)
}

const scrollToBottom = ()=>{
    let d = $('.main__chat_window')
    d.scrollTop(d.prop("scrollHeight"))
}


const muteButton = document.querySelector("#muteButton")
muteButton.addEventListener("click", () => {
  const enabled = myVideoStream.getAudioTracks()[0].enabled
  if (enabled) {
    myVideoStream.getAudioTracks()[0].enabled = false;
    html = `<i class="unmute fas fa-microphone-slash"></i>  <span>Unmute</span>`
    muteButton.innerHTML = html
  } else {
    myVideoStream.getAudioTracks()[0].enabled = true;
    html = `<i class="fas fa-microphone"></i> <span>Mute</span>`
    muteButton.innerHTML = html
  }
})

const stopVideo = document.querySelector("#stopVideo")
stopVideo.addEventListener("click", () => {
    const enabled = myVideoStream.getVideoTracks()[0].enabled
    if (enabled) {
      myVideoStream.getVideoTracks()[0].enabled = false
      html = `<i class="unmute fas fa-video-slash"></i>  <span>Start</span>`
      stopVideo.innerHTML = html
    } else {
      myVideoStream.getVideoTracks()[0].enabled = true
      html = `<i class="fas fa-video"></i> <span>Pause</span>`
      stopVideo.innerHTML = html
    }
})

var cnt=0
const chatButton = document.querySelector("#chatButton")
chatButton.addEventListener("click", (e) => {
    cnt= cnt+1
    const mainVideo = $("#main__left")
    const chat= $("#main__right")
    if(cnt%2 === 1){
        mainVideo.addClass('main__left_after')
        chat.addClass('main__right_after')
    }
    else{
        mainVideo.removeClass('main__left_after')
        mainVideo.addClass('main__left')
        chat.removeClass('main__right_after')
        chat.addClass('main__right')
    }
})



const inviteButton = document.querySelector('#inviteButton')
inviteButton.addEventListener("click", (e) => {
    prompt(
      "Copy this link and send it to people you want to meet with",
      window.location.href
    )
})


const leaveButton = $('#leaveButton')
leaveButton.addEventListener("click", ()=>{
    window.close()   
})

