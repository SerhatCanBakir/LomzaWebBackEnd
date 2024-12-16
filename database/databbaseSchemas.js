const { default: mongoose } = require("mongoose");

const chatSchema = new mongoose.Schema({
    group: Boolean,
    name:String,
    chatId: String,

})

const userSchema = new mongoose.Schema({

    email: { type: String },
    username: { type: String },
    password: { type: String },
    chats: { type: [chatSchema] },

})

const messageSchema = new mongoose.Schema({
    senderId:{type:String},
    senderName: { type: String },
    isPhoto: { type: Boolean },
    content: { type: mongoose.Schema.Types.Mixed },
    sendTime: { type: Date },
})

messageSchema.path('content').validate(function (value) {
    if (this.isPhoto === true) {
        return Buffer.isBuffer(value)
    } else if (this.isPhoto === false) {
        return typeof value === 'string'
    }
    return false

}, 'unvalid content');

const roomSchema = new mongoose.Schema({
    roomName: { type: String },
    roomId:{type:String},
    users: { type: [String] },
})

const friendrequestSchema = mongoose.Schema({
    senderId: String,
    senderName: String,
    receverId: String,
    SendTime: Date
});

friendrequestSchema.index({ recever: 1 });
userSchema.index({ email: 1 }, { unique: true });
roomSchema.index({ roomId: 1 }, { unique: true });

const userModel = mongoose.model('user', userSchema);
const roomModel = mongoose.model('room',roomSchema);

const friendrequestModel = mongoose.model('FriendRequest', friendrequestSchema);
module.exports = {
    userModel, 
    roomModel,
    messageSchema,
    friendrequestModel,
    chatSchema,
}