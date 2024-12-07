const mongoose = require('mongoose');
const dotenv = require('dotenv');
const { roomModel, userModel, messageSchema, friendrequestModel, chatSchema } = require('./databbaseSchemas');
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
 * @param {string} senderName 
 * @param {boolean} isPhoto 
 * @param {Buffer||String} content 
 * @returns {Boolean}
 */
const saveMessage = async (chatId, senderName, isPhoto, content) => {
    try {
        const messageModel = mongoose.model(chatId, messageSchema);
        const NewMessage = new messageModel({
            sender: senderName,
            isPhoto: isPhoto,
            content: content,
            sendTime: Date(),
        })
        await NewMessage.save();
        return true;
    } catch {
        return false
    }
}
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
 * @param {String} recever
 * @returns {Boolean} 
 */

const createFriendReq = async (sender, recever) => {
    try {
        const request = await friendrequestModel.findOne({ sender, recever });
        if (request) {
            return false; // Zaten bir istek mevcut
        }
        const NewRequest = new friendrequestModel({
            sender,
            recever,
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
        const username = await userModel.findById(docs.sender);
        if (docs) {
            const chatId = `${docs.sender}+${docs.recever}`;
            await addChatTOUser(username.username,docs.recever, chatId, false);
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
    try {
        const ChatDTO = { group: chatType, id: chatId, name: name };
        const data = await userModel.findByIdAndUpdate(
            userId,
            { $push: { chats: ChatDTO } },
            { new: true }
        );
        return !!data; // Güncelleme başarılıysa `true`, değilse `false`
    } catch (err) {
        console.error(err);
        return false;
    }
};

const GetAllFriendReq = async (id) => {
    try {
        const data = await friendrequestModel.find({ recever: id.toString() });
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

const GetAllFriend = async (id) => {
    try {
        const data = await userModel.findById(id).select("chats");
        return data || false;
    } catch (err) {
        console.error(err);
        return false;
    }
};


const CreateGroup = async (groupName, users) => {
    try {
        const NewRoom = new roomModel({
            roomName: groupName,
            users: users,
        });
        const oda = await NewRoom.save();

        for (const element of users) {
            await addChatTOUser(groupName,element.id, oda.id, 1);
        }

        return true;
    } catch (error) {
        console.error(error);
        return false;
    }
};

const RemoveChatToUser = async (userId, chatId) => {
    try {
        await userModel.findByIdAndUpdate(userId, { $pull: { chats: { id: chatId } } });
        return true;
    } catch (error) {
        console.error(error);
        return false;
    }
};


const RemoveUserToChat = async (userId, chatId) => {
    try {
        await roomModel.findByIdAndUpdate(chatId, { $pull: { users: userId } });

        const isRemoved = await RemoveChatToUser(userId, chatId);
        if (!isRemoved) {
            throw new Error('Failed to remove chat from user');
        }

        return true;
    } catch (error) {
        console.error(error);
        return false;
    }
};


module.exports = {
    Login,
    Register,
    acceptFriendReq,
    createFriendReq,
    declineFriendReq,
    CreateGroup,
    GetAllFriend,
    GetAllFriendReq,
    RemoveUserToChat
}