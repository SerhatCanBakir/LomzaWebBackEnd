const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();



       main().catch(err=>{
        console.log("err"+err)
       });  

async function main() {
  await  mongoose.connect(process.env.HOST||'mongodb://localhost:27017/LomzaWebDB');    
  console.log("host:"+process.env.HOST ||'mongodb://localhost:27017/LomzaWebDB');
   
}


const userSchema = new  mongoose.Schema({
userid:String,
username:String,
email:String,
password:String,
stat:String,
friendsId:[Number],
})

const textMessageSchema = new mongoose.Schema({
    senderId:String,
    sender:String,
    sendTime:Date,
    content:String

});



const userModel =  mongoose.model('user',userSchema);


const  login = async(mail,pass)=> {
    let a = await userModel.findOne({email:mail});
    console.log("login Find:"+a);
    if(a===null){
return null;
    }else if(a.password!=pass){
     return false;
    }else{
        return a ; 
    }
}

const register = async(mail,username,pass)=>{
   const log =await login(mail,pass);
   console.log("register login :"+log);
   if(log==null){
  let count = await userModel.countDocuments();
   const NewUser = new userModel({
    id:count+1,
    email:mail,
    username:username,
    password:pass,
    stat:"avalible",
    friendsId:[],
   })
   console.log('kullanıcı kaydedildi');
   let a = await NewUser.save();
   console.log('kullanıcı :' +a);
    return a
   }else{
    return false;
   }
}

const textMessageSave=async (chatId,sender,text)=>{
    if(typeof chatId ==="string"){
        console.log(chatId+sender+text);
    const textMessageModel = await mongoose.model(chatId,textMessageSchema);
    const NewMessage = new textMessageModel({
        senderId:sender.id,
        sender:sender.username,
        sendTime:Date(),
        content:text,
    })
   let a = await NewMessage.save();
   
   console.log('mesaj kayıtli =\n'+a);
   return a ;
}else{
    return null;
}
 
}

const getAllMessage = async(chatId)=>{
    const textMessageModel = mongoose.model(chatId,textMessageSchema);
    const a = await textMessageModel.find();
    return a;
}

const changeStatus =async (userID,Stat)=>{
let a = await userModel.updateOne({id:userID},{$set:{stat:Stat}});
return a ;
}

const addRoomToUser = (chatId,userId)=>{
    
}

module.exports={
    login,
    register,
    textMessageSave,
    getAllMessage,
    changeStatus,

}