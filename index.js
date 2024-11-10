const exp = require('express');
const app = exp();
const http = require('http');
const server = http.createServer(app);
const { Server } = require('socket.io');
const JWT = require('jsonwebtoken');
const bodyParser = require("body-parser");

const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    },

});
const DB = require('./database/databaseFunc.js');


const KEY = "7e702CCBEDU2gqt8qRfXtp6m6ht0Mhie";

app.use(bodyParser.json());

app.post('/login', async (req, res) => {
   console.log("login calisti");
   console.log(req.body);
    let email = req.body.email;
    let password = req.body.password;
    console.log("mail:"+email+"\npass:"+password);

    if(email == null || password == null || email == undefined || password == undefined) {
        res.sendStatus(400);
        return
    }
    let data = await DB.login(email, password);
    console.log("data:"+data)
    if (data != false && data != null) {
        
        let id = data.id;
        let name = data.username;
        
        let token = JWT.sign(data.toJSON(), KEY);
        res.status(202).send({ id: id, username: name, token: token });
        return
    } else if (data != false && data == null) {
        res.sendStatus(204);
        return;
    } else {
        res.sendStatus(403);
        return;
    }
})

app.post('/register',async (req, res) => {
    console.log("register calisti");
    console.log(req.body);
    let mail = req.body.email;
    let username = req.body.username;
    let pass = req.body.password;
    console.log("mail:"+mail+"\nusername:"+username+"\npassword:"+pass);
    if (mail == null || mail == undefined || username == null || username == undefined || pass == null || pass == undefined) {
        res.sendStatus(400);
        return;
    }
    
    let temp  = await DB.register(mail,username,pass);
    if(temp!=false){
        res.sendStatus(201);
        return;
    } else{
        
        res.sendStatus(406);
        return;
    }

})

app.get('/joinchat',(req,res)=>{

});


app.post('/addFriend',(req,res)=>{
    
})
io.on('connection', (socket) => {
    console.log("socket id="+socket.id);

    socket.on('room-switch', (chatid) => {
        console.log('socket katıldı :' +socket.id+"\nchat : "+chatid);
        socket.join(chatid);
    })

    socket.on('message-send', async(object) => {
        io.to(object.chatId).emit('message-get', object);
        console.log(object);
       let a =await  DB.textMessageSave(object.chatId,object.Sender,object.content);
       if(a===null){
        io.to(object.chatId).emit('error','server-error');
       }

    })

    socket.on('get-all', async(ChatId) => {
      console.log('socket butun mesajları aldı : '+socket.id+"\noda : "+ChatId);
      let a = await DB.getAllMessage(ChatId);
        socket.emit('send-all',a);
    })

})


io.on('disconnect', (socket) => {
    console.log("disconnect : " + socket.id)
})



server.listen(433,'10.38.56.172', () => {
    console.log('server open');
})