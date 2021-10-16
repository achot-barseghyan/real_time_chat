const socket = io();
const chatForm = document.getElementById("chat-form");
const chatMessages = document.querySelector('.chat-messages');
const roomContainer = document.getElementById('room-name');
const usersContainer = document.getElementById('users');
const alerteButton = document.querySelector('.alerte');

//Get username and room from URL with the api 'qs'
const {username, room} = Qs.parse(location.search, {
    ignoreQueryPrefix : true
});

//Join chatroom
socket.emit('join-room', {username, room});

//Get room and users
socket.on('roomUsers', ({room, users}) =>{
    outputRoom(room);
    outputUsers(users);
});

//Message from server
socket.on('message', message => {
    console.log(message);
    outputMessage(message);

    //scroll down
    chatMessages.scrollTop = chatMessages.scrollHeight;
});

socket.on('alerte', () => {
    alert();
});

alerteButton.addEventListener('click', () => {
    socket.emit('alerte');
});

//Message submit
chatForm.addEventListener('submit', (e) => {
    e.preventDefault();

    //Get message text from input
    const msg = e.target.elements.msg.value;
    
    //Emit a message to the server
    socket.emit('chat-message',msg);

    //Clear input
    e.target.elements.msg.value = '';
    e.target.elements.msg.focus();
});

//Output message to DOM
function outputMessage(message) {
    const div = document.createElement('div');
    div.classList.add('message');
    div.innerHTML = `<p class="meta">${message.username} <span>${message.time}</span></p>
    <p class="text">
        ${message.text}
    </p>`;
    document.querySelector('.chat-messages').appendChild(div);
}

//Add room name to DOM
function outputRoom() {
    roomContainer.innerHTML = room;
}

//Add users to DOM
function outputUsers(users) {
    usersContainer.innerHTML = `
        ${users.map(user => `<li>${user.username}</li>`).join('')}
    `;
}