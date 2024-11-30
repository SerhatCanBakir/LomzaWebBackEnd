const exp = require('express');
const app = exp();
const http = require('http');
const server = http.createServer(app);
const { Server } = require('socket.io');
const JWT = require('jsonwebtoken');
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser');
const KEY = "7e702CCBEDU2gqt8qRfXtp6m6ht0Mhie";
import { acceptFriendReq, createFriendReq, declineFriendReq, GetAllFriend, GetAllFriendReq, Login, Register } from "./database/databaseFunc.js"
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    },

});

app.use(cookieParser());
app.use(bodyParser.json());

const tokenBaseOuth = (req, res, next) => {
    const token = req.cookies.token;
    console.log(token);

    if (token != null) {
        let data = JWT.verify(token, KEY);
        req.userdata = data;
        next();
    } else {
        res.status(401).send('token unotherized');
    }
}




app.post('/login', async (req, res) => {
    const mail = req.body.email;
    const pass = req.body.password;
    if (!(mail && pass)) {
        res.sendStatus(400)
    }
    try {
        const userObject = await Login(mail, pass)
        if (userObject) {
            const userToken = JWT.sign(userObject, KEY, { expiresIn: 60 * 60 * 60 });
            res.status(202).json({ token: userToken, id: userObject._id, username: userObject.username })
        } else {
            res.sendStatus(204)
        }
    } catch { res.sendStatus(500) };

})

app.post('/register', async (req, res) => {
    const mail = req.body.email;
    const username = req.body.username;
    const password = req.body.password;
    if (!(mail && username && password)) {
        res.sendStatus(400);
    }

    const RegStatus = await Register(mail, username, password);
    if (RegStatus) {
        res.sendStatus(201)
    } else {
        res.sendStatus(406);
    }
})

app.post('/groups/creategroup',tokenBaseOuth,async(req,res)=>{

})

app.post('/groups/:groupId/addmember', tokenBaseOuth,async (req, res) => {

})

app.post('/groups/:groupId/removemember', tokenBaseOuth,async (req, res) => {

})

app.get('/friendrequest', tokenBaseOuth, async (req, res) => {
    const id = req.userdata.id;
    const requests = await GetAllFriendReq(id);
    if (requests) { res.status(200).json(requests); }
    res.sendStatus(500);
})

app.get('/friends', tokenBaseOuth, async (req, res) => {
    const id = req.userdata.id;
    const friends = await GetAllFriend(id);
    if (friends) {
        res.status(200).json(friends)
    }
    res.sendStatus(500);
})

app.post('/addfriend', tokenBaseOuth, async (req, res) => {
    const friendId = req.body.friendId;
    const userId = req.userdata.id;
    if (!(friendId && userId)) {
        res.sendStatus(400);
    }
    const requestStatus = await createFriendReq(friendId, userId);
    if (requestStatus) {
        res.sendStatus(201);
    }
    res.sendStatus(500);
})

app.post('/friendrequests/:id/accept', tokenBaseOuth, async (req, res) => {
    const id = req.params.id;
    const AcceptReq = await acceptFriendReq(id);
    if (AcceptReq) {
        res.sendStatus(200);
    }
    res.sendStatus(400);
})

app.post('/friendrequests/:id/decline', tokenBaseOuth,async (req, res) => {
    const id = req.params.id;
    const AcceptReq = await declineFriendReq(id);
    if (AcceptReq) {
        res.sendStatus(200);
    }
    res.sendStatus(400);
})


io.on('connection', (socket) => {

})


io.on('disconnect', (socket) => {
    console.log("disconnect : " + socket.id)
})



server.listen(433, '10.38.56.172', () => {
    console.log('server open');
})