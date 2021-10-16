const path = require('path');
const http = require('http');
const express = require('express');
const socketio = require('socket.io');
const formatMessage = require('./utils/messages');
const {userJoin, getCurrentUser, userLeave, getRoomUsers} = require('./utils/users')
const open = require('open');
const ip = require('ip');
const PORT = 5000 || process.env.POST;

const app = express();
const server = http.createServer(app);
const io = socketio(server);

const botName = 'ChatBot';

let localIP = ip.address(); 
open(`http://${localIP}:${PORT}`);

//SET static folder
app.use(express.static(path.join(__dirname, 'public')));

//RUN When a client connects
io.on('connection', socket => {

    socket.on('join-room', ({username, room}) => {
        const user = userJoin(socket.id,username, room);
        //
        socket.join(user.room);

        //welcome the current user
        socket.emit('message',formatMessage(botName,'welcome to the chat room'));

        //broadcast when a user connects
        socket.broadcast
            .to(user.room)
            .emit('message', formatMessage(botName,`${user.username} has join the chat`)
        );

        //Send users and room infos
        io.to(user.room).emit('roomUsers', {
            room: user.room,
            users: getRoomUsers(user.room)
        });
    })

    //Listen for chat-message
    socket.on('chat-message', msg => {
            const user = getCurrentUser(socket.id);

            //sending back to the front for everyone
            io.to(user.room)
            .emit('message', formatMessage(user.username,msg)
        );
    });

        //Listen for alert
        socket.on('alerte', () => {
            //sending back to the front for everyone
            socket.broadcast.emit('alerte');
    });

    //run when client disconnects
    socket.on('disconnect', () => {
        const user = userLeave(socket.id);

        if (user) {
            io.to(user.room).emit('message', formatMessage(botName,`${user.username} left the chat`));
        }

        //Send users and room infos
        io.to(user.room).emit('roomUsers', {
            room: user.room,
            users: getRoomUsers(user.room)
        });
    });

});

server.listen(PORT, ()=> console.log(`server is running on port ${PORT}`));