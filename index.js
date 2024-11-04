const exp = require('express');
const app = exp();
const http = require('http');
const server = http.createServer(app);
const { Server } = require('socket.io');
const JWT = require('jsonwebtoken');

const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    },

});
const DB = require('./database/databaseFunc.js');
const { register } = require('module');

const KEY = "7e702CCBEDU2gqt8qRfXtp6m6ht0Mhie";

app.use(exp.json());

app.post('/login', async (req, res) => {

    let email = req.body.email;
    let password = req.body.password;
    if (email == null || password == null || email == undefined || password == undefined) {
        res.sendStatus(400);
    }
    let data = await DB.login(email, password);
    if (data != false && data != null) {
        let id = data.id;
        let name = data.username;
        let token = JWT.sign(data, KEY);
        res.status(202).send({ id: id, username: name, token: token });
    } else if (data != false && data == null) {
        res.sendStatus(204);
    } else {
        res.sendStatus(403);
    }
})

app.post('/register',async (req, res) => {
    let mail = req.body.email;
    let username = req.body.username;
    let pass = req.body.password;
    if (mail == null || mail == undefined || username == null || username == undefined || pass == null || pass == undefined) {
        res.sendStatus(400);
    }
    
    let temp  = await DB.register(mail,username,pass);
    if(temp!=false){
        res.sendStatus(201);
    } else{
        res.sendStatus(406);
    }

})

io.on('connection', (socket) => {
    console.log(socket.id);

    socket.on('room-switch', (chatid) => {
        socket.join(chatid);
    })

    socket.on('message-send', (chatId, sender, text) => {
        socket.to(chatId).emit('message-get', (sender, text));

    })

    socket.on('get-all', (ChatId) => {

    })

})


io.on('disconnect', (socket) => {
    console.log("disconnect : " + socket.id)
})



server.listen(433, () => {
    console.log('server open');
})