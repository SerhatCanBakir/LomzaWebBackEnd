const mongoose = require('mongoose');
const dotenv = require('dotenv');
import { roomModel, userModel, messageSchema, friendrequestModel, chatSchema } from './databbaseSchemas';
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
export const Login = async (mail, pass) => {
    await userModel.find({ email: mail }).select('-chats').exec((err, user) => {
        if (err) {
            return err
        }
        if (user[0].password === pass) { return user }
        else {
            return false
        }
    })
}

/**
 * 
 * @param {String} mail 
 * @param {String} username 
 * @param {String} pass
 * @returns {Boolean}
 * 
 */
export const Register = async (mail, username, pass) => {
    await userModel.find({ email: mail }).select('_id').exec(async (err, user) => {
        if (err) {
            return err;
        }
        if (user !== null) {
            return false
        } else {
            const NewUser = new userModel({
                email: mail,
                username: username,
                password: pass,
                chats: [],
            })
            await NewUser.save();
            return true
        }
    })
}
/**
 * 
 * @param {string} chatId 
 * @param {string} senderName 
 * @param {boolean} isPhoto 
 * @param {Buffer||String} content 
 * @returns {Boolean}
 */
export const saveMessage = async (chatId, senderName, isPhoto, content) => {
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
export const getChatMessages = async (chatId) => {
    await mongoose.model(chatId, messageSchema).findById(chatId).exec((err, msgs) => {
        if (err) {
            return false
        }
        if (msgs) {
            return msgs
        }
    })
}

/**
 * 
 * @param {String} sender 
 * @param {String} recever
 * @returns {Boolean} 
 */

export const createFriendReq = async (sender, recever) => {
    await friendrequestModel.find({ sender: sender, recever: recever }).exec(async (err, request) => {
        if (err) {
            console.log(err)
            return false
        }

        if (request !== null) {
            return false
        }
        const NewRequest = new friendrequestModel({
            sender: sender,
            recever: recever,
            sendTime: Date(),
        })
        await NewRequest.save();
        return true
    })

}


/**
 * 
 * @param {String} reqId
 * @returns {Boolean} 
 */
export const acceptFriendReq = async (reqId) => {
    await friendrequestModel.findByIdAndDelete(reqId, async (err, docs) => {
        if (err) {
            console.log(err)
            return false
        }
        if (docs) {
            const chatod = docs.sender + "+" + docs.recever;
            await addChatTOUser(docs.recever, chatod, false);
            // add friend func add here D:
            return true;
        }
        return false
    })
}

/**
 * 
 * @param {String} reqId
 * @returns {Boolean} 
 */

export const declineFriendReq = async (reqId) => {
    await friendrequestModel.findByIdAndDelete(reqId, (err, docs) => {
        if (err) {
            console.log(err)
            return false
        }
        if (docs) {
            return true;
        }
        return false
    })
}

/**
 * 
 * @param {String} userId 
 * @param {String} chatId 
 * @param {Boolean} chatType 
 * @returns {boolean}
 */

const addChatTOUser = async (userId, chatId, chatType) => {
    e
    const ChatDTO = { group: chatType, id: chatId };
    await userModel.findByIdAndUpdate(userId, { $push: { chats: ChatDTO } }).exec((err, data) => {
        if (err) {
            console.log(err);
            return false
        }
        if (data) {
            return true;
        }

        return false;
    });
}

export const GetAllFriendReq = async (id) => {
    await friendrequestModel.find({ recever: id }).exec((err, data) => {
        if (err) {
            console.log(err);
            return false
        }

        if (data) {
            return data
        }

        return false
    })
}

export const GetAllFriend = async (id) => {
    await userModel.findById(id).select("chats").exec((err, data) => {
        if (err) {
            console.log(err);
            return false
        }

        if (data) {
            return data;
        }

        return false
    })
}

export const CreateGroup = async (groupName, users) => {
    try {
        const NewRoom = new roomModel({
            roomName: groupName,
            users: users,
        })
        const oda = await NewRoom.save()
        users.forEach(async (element) => {
            await addChatTOUser(element.id, oda.id, 1);
        })
        return true
    } catch {
        return false
    }
}

export const RemoveChatToUser = async(userId,chatId) => {
   await userModel.findByIdAndUpdate(userId,{$pull:{chats:{_id:chatId}}});
 }