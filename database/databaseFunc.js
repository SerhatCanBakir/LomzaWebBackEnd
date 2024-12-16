const mongoose = require('mongoose');
const dotenv = require('dotenv');

const { userModel, messageSchema, friendrequestModel, chatSchema, roomModel } = require('./databbaseSchemas');
const e = require('express');
dotenv.config();



main().catch(err => {
    console.log("err" + err)
});

async function main() {
    await mongoose.connect(process.env.HOST || 'mongodb://localhost:27017/LomzaWebDB');
    console.log("host:" + process.env.HOST || 'mongodb://localhost:27017/LomzaWebDB');

}

/**
 * 
 * @param {string} mail 
 * @param {string} pass
 * @returns {object||false}
 * if login is sucses retun info else return false  
 */
const Login = async (mail, pass) => {
    try {
        const userdata = await userModel.findOne({ email: mail }).select('-chats');
        console.log(JSON.stringify(userdata) + '\n' + mail + '\n' + pass);

        if (userdata && userdata.password === pass) {
            return userdata;
        }
        return false;
    } catch (error) {
        console.error(error);
        return false;
    }
};


/**
 * 
 * @param {String} mail 
 * @param {String} username 
 * @param {String} pass
 * @returns {Boolean}
 * 
 */
const Register = async (mail, username, pass) => {
    try {
        const user = await userModel.findOne({ email: mail }).select('_id');
        if (user) {
            return false;
        }

        const NewUser = new userModel({
            email: mail,
            username: username,
            password: pass,
            chats: [],
        });

        await NewUser.save();
        return true;
    } catch (error) {
        console.error(error);
        return false;
    }
};

/**
 * 
 * @param {string} chatId 
 * @param {Object} senderName 
 * @param {boolean} isPhoto 
 * @param {Buffer||String} content 
 * @returns {Boolean}
 */
const saveMessage = async (chatId, senderName, isPhoto, content) => {
    try {
        console.log('Message save function is called.');

        const senderId = senderName.userid;
        const senderUsername = senderName.username;

        // Dinamik olarak Mongoose modeli seç veya oluştur
        const messageModel =
            mongoose.models[chatId] || mongoose.model(chatId, messageSchema);

        // Eğer fotoğraf ise, content'i base64'ten Buffer'a dönüştür
        const processedContent = isPhoto ? Buffer.from(content, 'base64') : content;

        // Yeni mesaj nesnesi oluştur
        const NewMessage = new messageModel({
            senderId: senderId,
            senderName: senderUsername,
            isPhoto: isPhoto,
            content: processedContent,
            sendTime: new Date(),
        });

        // Mesajı veritabanına kaydet
        const savedMessage = await NewMessage.save();
        console.log('Message saved:', savedMessage);

        return true;
    } catch (error) {
        console.error('Error while saving message:', error);
        return false;
    }
};

/**
 * 
 * @param {String} chatId 
 * @returns {false||[object]}
 */
const getChatMessages = async (chatId) => {
    try {
        const messageModel = mongoose.models[chatId] || mongoose.model(chatId, messageSchema);
        const msgs = await messageModel.find();
        return msgs.length ? msgs : false;
    } catch (error) {
        console.error(error);
        return false;
    }
};



/**
 * 
 * @param {String} sender 
 * @param {String} senderName 
 * @param {String} recever
 * @returns {Boolean} 
 */

const createFriendReq = async (senderId, senderName, recever) => {
    try {
        const request = await friendrequestModel.findOne({ senderId, recever });
        if (request) {
            return false; // Zaten bir istek mevcut
        }
        const NewRequest = new friendrequestModel({
            senderId: senderId,
            senderName: senderName,
            receverId: recever,
            sendTime: new Date(),
        });
        await NewRequest.save();
        return true;
    } catch (error) {
        console.error(error);
        return false;
    }
};



/**
 * 
 * @param {String} reqId
 * @returns {Boolean} 
 */
const acceptFriendReq = async (reqId) => {
    try {
        const docs = await friendrequestModel.findByIdAndDelete(reqId);
        console.log('docs : ' + docs);
        const username = await userModel.findById(docs.senderId);
        console.log('AFQ username' + username);
        if (docs) {
            const chatId = `${docs.senderId}+${docs.receverId}`;
            await addChatTOUser(username.username, docs.receverId, chatId, false);
            const recevername = await userModel.findById(docs.receverId).select('username');
            await addChatTOUser(recevername.username, username.id, chatId, false);
            return true;
        }
        return false;
    } catch (error) {
        console.error(error);
        return false;
    }
};


/**
 * 
 * @param {String} reqId
 * @returns {Boolean} 
 */

const declineFriendReq = async (reqId) => {
    try {
        const docs = await friendrequestModel.findByIdAndDelete(reqId);
        return !!docs;
    } catch (error) {
        console.error(error);
        return false;
    }
};



/**
 * @param  {String} name --group or user name 
 * @param {String} userId 
 * @param {String} chatId 
 * @param {Boolean} chatType 
 * @returns {boolean}
 */

const addChatTOUser = async (name, userId, chatId, chatType) => {
    console.log('addChatToUser çalıştı ')
    try {
        const ChatDTO = { group: chatType, chatId: chatId, name: name };
        const data = await userModel.findByIdAndUpdate(
            userId,
            { $push: { chats: ChatDTO } },
            { new: true }
        );
        console.log('AddChatToUser Değeri' + data);
        return !!data; // Güncelleme başarılıysa `true`, değilse `false`
    } catch (err) {
        console.error(err);
        return false;
    }
};


/**
 * 
 * @param {String} id 
 * @returns {Object||boolean} 
 */
const GetAllFriendReq = async (id) => {
    try {
        const data = await friendrequestModel.find({ receverId: id.toString() });
        console.log(data);
        if (Array.isArray(data)) {
            return data
        }
        return [data] || false;
    } catch (err) {
        console.error(err);
        return false;
    }
};

/**
 * 
 * @param {String} id 
 * @returns {[Object||Boolean]}
 */
const GetAllFriend = async (id) => {
    try {
        const data = await userModel.findById(id).select("chats");
        return data || false;
    } catch (err) {
        console.error(err);
        return false;
    }
};

/**
 * 
 * @param {String} groupName 
 * @param {[String]} users 
 * @returns {boolean} 
 */

const CreateGroup = async (groupName, users) => {
    console.log('grup name : ' + groupName + '\n users' + users)
    try {
        const groupId = require('crypto').randomBytes(32).toString('hex');
        const NewRoom = new roomModel({
            roomId: groupId,
            roomName: groupName,
            users: users,
        })
        users.forEach(user => {
            addChatTOUser(groupName, user, groupId, 1);
        })
        await NewRoom.save();
        return true


    } catch (error) {
        console.error(error);
        return false;
    }
};

const TakeGroupMembers = async (id) => {
    try {
        console.log('id : ' + id);
        const users = await roomModel.find({ roomId: id }).select('users');

        if (Array.isArray(users[0].users)) {
            // Her kullanıcı ID'si için findById yapan Promise'lar oluşturulur
            const promises = users[0].users.map((element) => userModel.findById(element));

            // Tüm Promise'lar tamamlandığında sonuçları data'ya alırız
            const data = await Promise.all(promises);

            console.log('beklenen dönen data : ', data);
            return data;
        }
        return false;
    } catch (err) {
        console.log(err);
        return false;
    }
}


/**
 * 
 * @param {String} chatId 
 * @param {String} userId 
 * @returns 
 */
const RemoveChatToUser = async (userId, chatId) => {
    try {
        await userModel.findByIdAndUpdate(userId, { $pull: { chats: { chatId: chatId } } });
        return true;
    } catch (error) {
        console.error(error);
        return false;
    }
};

/**
 * 
 * @param {String} userId 
 * @param {String} chatId 
 * @returns 
 */
const RemoveUserToChat = async (userId, chatId) => {
    try {
        const a = await roomModel.findOneAndUpdate({ roomId: chatId }, { $pull: { users: userId } });
        await RemoveChatToUser(userId, chatId);
        if (a) {
            return true
        }
    } catch (error) {
        console.error(error);
        return false;
    }
};


const addUserToChat = async (userId, groupId) => {
    console.log('addUserToChat userId:' + userId + '\ngroup Id : ' + groupId);
    try {
        const a = await roomModel.findOneAndUpdate({ roomId: groupId }, { $push: { users: userId } });
        console.log('a : '+a);
        const b = await addChatTOUser(a.roomName, userId, a.roomId, 1);
        if (a && b) { return true }
        return false
    } catch (err) { 

        console.log(err)
        return false
    }
}


module.exports = {
    Login,
    Register,
    acceptFriendReq,
    createFriendReq,
    declineFriendReq,
    CreateGroup,
    GetAllFriend,
    GetAllFriendReq,
    RemoveUserToChat,
    getChatMessages,
    saveMessage,
    TakeGroupMembers,
    addChatTOUser,
    addUserToChat
}