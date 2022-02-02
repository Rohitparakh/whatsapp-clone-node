/////////////////////////////////////////////////////////////////////////////////////////////////////////
// Socket file

import { Server } from 'socket.io';

const io = new Server(9000, {
    cors: {
        origin: 'http://localhost:3000',
    }, 
})


let users = [];

const addUser = (userId, socketId) => {
    !users.some(user => user.userId === userId) && users.push({ userId, socketId });
}

const removeUser = (socketId) => {
    users = users.filter(user => user.socketId !== socketId);
}

const getUser = (userId) => {
    return users.find(user => user.userId === userId);
}

io.on('connection',  (socket) => {
    console.log('user connected')

    //connect
    socket.on("addUser", userId => {
        addUser(userId, socket.id);
        io.emit("getUsers", users);
    })

    //send message
    socket.on('sendMessage', ({ senderId, receiverId, text }) => {
        const user = getUser(receiverId);
        io.to(user.socketId).emit('getMessage', {
            senderId, text
        })
    })

    //disconnect
    socket.on('disconnect', () => {
        console.log('user disconnected');
        removeUser(socket.id);
        io.emit('getUsers', users);
    })
})

/////////////////////////////////////////////////////////////////////////////////////////////////////////
//Server file


import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import dotenv from 'dotenv';

import Connection from './database/db.js';
import Routes from './routes/Routes.js';


dotenv.config();
const app = express();

const PORT = 8080;

// const username = process.env.DB_USERNAME;
// const password = process.env.DB_PASSWORD;

Connection();

app.listen(PORT, () => console.log(`Server is running successfully on PORT ${PORT}`));

app.use(bodyParser.json({ extended: true }));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());
app.use('/', Routes);