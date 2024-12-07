const exp = require('express');
const app = exp();
const http = require('http');
const server = http.createServer(app);
const { Server } = require('socket.io');
const JWT = require('jsonwebtoken');
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser');
const KEY = "7e702CCBEDU2gqt8qRfXtp6m6ht0Mhie";
const cors = require('cors');
const { acceptFriendReq, createFriendReq, CreateGroup, declineFriendReq, GetAllFriend, GetAllFriendReq, Login, Register, RemoveUserToChat } = require("./database/databaseFunc.js");

app.use(exp.json());
app.use(cookieParser());


    const io = new Server(server, {
        cors: {
            origin: "http://localhost:3000",
            methods: ["GET", "POST"],
            credentials: true,
        },

    });
    app.use(
    cors({
        origin: "http://localhost:3000", // React uygulamasının çalıştığı port
        credentials: true, // Çerez veya kimlik doğrulama bilgileri için
    })
    );



    const tokenBaseOuth = (req, res, next) => {
        let token;
    
        // Authorization header: Bearer <token>
        const authHeader = req.headers.authorization;
        if (authHeader && authHeader.startsWith('Bearer ')) {
            token = authHeader.substring(7); // 'Bearer ' kelimesini çıkar
        }
    
        // Eğer Authorization yoksa cookie'den al
        if (!token && req.cookies?.token) {
            token = req.cookies.token;
        }
    
        console.log(`Token received: ${token || 'None'}`);
    
        if (!token) {
            return res.status(401).json({
                message: 'Unauthorized access',
                error: 'Token not provided',
            });
        }
    
        try {
            const data = JWT.verify(token, KEY);
            req.userdata = data;
            next();
        } catch (error) {
            console.error('Invalid token:', error.message);
            return res.status(401).json({
                message: 'Unauthorized access',
                error: 'Token is invalid or expired',
            });
        }
    };
    



app.post('/login', async (req, res) => {
    const { email: mail, password: pass } = req.body;

    if (!(mail && pass)) {
        return res.sendStatus(400); // Eksik giriş bilgisi
    }
req.header
    try {
        const userObject = await Login(mail, pass);

        if (userObject) {
            const tokenPayload = { id: userObject._id, username: userObject.username };
            const userToken = JWT.sign(tokenPayload, KEY);
            res.cookie('token', userToken, {
                httpOnly: true,
                secure: false, // HTTPS yoksa false
                maxAge: 24 * 60 * 60 * 1000, // 1 gün
                sameSite: 'Lax', // "None" veya "Strict" test edin
                path: '/'
            });
            return res.status(202).json({
                token: userToken,
                id: userObject._id,
                username: userObject.username
            });
        } else {
            return res.sendStatus(401); // Yanlış e-posta veya şifre
        }
    } catch (error) {
        console.error(error);
        return res.sendStatus(500); // Sunucu hatası
    }
});

app.post('/register', async (req, res) => {
    const { email: mail, username, password } = req.body;

    if (!(mail && username && password)) {
        return res.sendStatus(400);
    }

    try {
        const RegStatus = await Register(mail, username, password);
        if (RegStatus) {
            return res.sendStatus(201);
        } else {
            return res.sendStatus(406);
        }
    } catch (error) {
        console.error(error);
        return res.sendStatus(500);
    }
});


app.get('/getrooms', tokenBaseOuth, async (req, res) => {
    try {
        const friends = await GetAllFriend(req.userdata.id)

        console.log(friends);
        
       
        res.status(200).send(friends.toJSON());
    } catch (err) {
        res.status(500).send(err);
    }
})
app.post('/groups/creategroup', tokenBaseOuth, async (req, res) => {
    const { groupName, users } = req.body;

    if (groupName && users && Array.isArray(users)) {
        try {
            const StatusOfCreateGroup = await CreateGroup(groupName, users);
            if (StatusOfCreateGroup) {
                return res.sendStatus(201);
            } else {
                return res.sendStatus(500);
            }
        } catch (error) {
            console.error(error);
            return res.sendStatus(500); // Internal Server Error
        }
    }

    return res.sendStatus(400); // Bad Request
});



app.post('/groups/:groupId/removemember', tokenBaseOuth, async (req, res) => {
    const userId = req.body.userId;
    const ChatID = req.params.groupId;

    if (!(userId && ChatID)) {
        return res.sendStatus(400); // Bad Request
    }

    try {
        const Status = await RemoveUserToChat(userId, ChatID);
        if (Status) {
            return res.sendStatus(200); // OK
        } else {
            return res.sendStatus(500); // Internal Server Error
        }
    } catch (error) {
        console.error(error);
        return res.sendStatus(500); // Internal Server Error
    }
});

app.get('/friendrequests', tokenBaseOuth, async (req, res) => {
    const id = req.userdata.id;
    try {
        console.log('friend req id : ' + id)
        const requests = await GetAllFriendReq(id);
        console.log('istekler : ' + requests);
        if (requests) {
            return res.status(200).json(requests);
        }
        console.log('arkadaslık istegi bulamadı : ' + requests)
        return res.sendStatus(404); // Arkadaş isteği bulunamadı
    } catch (error) {
        console.error(error);
        return res.sendStatus(500);
    }
});

app.get('/friends', tokenBaseOuth, async (req, res) => {
    const id = req.userdata.id;
    try {
        const friends = await GetAllFriend(id);
        console.log('arkadaslar : ' + friends);
        if (friends) {
            return res.status(200).json(friends);
        }
        console.log('arkadas bulunmadı :' + friends)
        return res.sendStatus(404); // Arkadaş bulunamadı
    } catch (error) {
        console.error(error);
        return res.sendStatus(500);
    }
});

    app.post('/addfriend/:id', tokenBaseOuth, async (req, res) => {

        const friendId = req.params.id;

        const userId = req.userdata.id;
        console.log("\n" + friendId + "\n" + userId)
        if (!(friendId && userId)) {
            return res.sendStatus(400); // Eksik veri
        }

        try {
            const requestStatus = await createFriendReq(friendId, userId);
            if (requestStatus) {
                return res.sendStatus(201); // Başarıyla oluşturuldu
            }
            console.log(requestStatus);
            return res.sendStatus(500);
        } catch (error) {
            console.error(error);
            return res.sendStatus(500);
        }
    });

    app.post('/friendrequests/accept', tokenBaseOuth, async (req, res) => {
        console.log(req.body);
        const id = req.body.id;
        console.log('friend accep id :  '+id);
        try {
            const AcceptReq = await acceptFriendReq(id);
            if (AcceptReq) {
                return res.sendStatus(200); // Başarıyla kabul edildi
            }
            return res.sendStatus(404); // Arkadaş isteği bulunamadı
        } catch (error) {
            console.error(error);
            return res.sendStatus(500);
        }
    });

    app.post('/friendrequests/decline', tokenBaseOuth, async (req, res) => {
        const id = req.body.id;
        try {
            const DeclineReq = await declineFriendReq(id);
            if (DeclineReq) {
                return res.sendStatus(200); // Başarıyla reddedildi
            }
            return res.sendStatus(404); // Arkadaş isteği bulunamadı
        } catch (error) {
            console.error(error);
            return res.sendStatus(500);
        }
    });


io.on('connection', (socket) => {
    console.log(socket.id);
})


io.on('disconnect', (socket) => {
    console.log("disconnect : " + socket.id)
})



server.listen(433, () => {
    console.log('server open');
})