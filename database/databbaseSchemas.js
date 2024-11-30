const { default: mongoose } = require("mongoose");

export const chatSchema = new mongoose.Schema({
    group:Boolean,
    id:String,
})

const userSchema = new mongoose.Schema({
    
    email:{type:String},
    username:{type:String},
    password:{type:String},
    chats:{type:[chatSchema]},
    
})

export const messageSchema = new mongoose.Schema({
    sender:{type:String},
    isPhoto:{type:Boolean},
    content:{type:mongoose.Schema.Types.Mixed},
    sendTime:{type:Date},
})

messageSchema.path('content').validate(function (value){
if(this.isPhoto===1){
        return Buffer.isBuffer(value)               
}else if(this.isPhoto===0){
    return typeof  value === 'string'
}
    return false 

},'unvalid content');

const roomSchema = new mongoose.Schema({
    roomName:{type:String},
    users:{type:[String]},
})

const friendrequestSchema  = mongoose.Schema({
    sender:String,
    recever:String,
    SendTime:Date
});

friendrequestSchema.index({recever:1});
userSchema.index({email:1},{unique:true});
roomSchema.index({roomId:1},{unique:true});

export const userModel = mongoose.model('user',userSchema);

export const roomModel = mongoose.model('room',roomSchema);

export const friendrequestModel = mongoose.model('FriendRequest',friendrequestSchema);
 