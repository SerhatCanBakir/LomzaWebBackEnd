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
userid:Number,
username:String,
email:String,
password:String,
stat:String,
})

const textMessageSchema = new mongoose.Schema({
    sender:String,
    sendTime:Date,
    content:String

});



const userModel =  mongoose.model('user',userSchema);


const  login = async(mail,pass)=> {
    let a = await userModel.findOne({email:mail});
    if(a==null){
return null;
    }else if(a.password!=pass){
     return false;
    }else{
        return a ; 
    }
}

const register = async(mail,username,pass)=>{
   const log = login(mail,pass);
   if(log==null){
  let count = await userModel.countDocuments();
   const NewUser = new userModel({
    id:count+1,
    email:mail,
    username:username,
    password:pass,
    stat:"avalible",
   })
   
   let a = await NewUser.save();
    return a
   }else{
    return false;
   }
}

const textMessageSave=async (chatId,sender,text)=>{
    const textMessageModel = mongoose.model(chatId,textMessageSchema);
    const NewMessage = new textMessageModel({
        sender:sender,
        sendTime:Date(),
        content:text,
    })
   let a = await NewMessage.save();
   return a ;
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


module.exports={
    login,
    register,
    textMessageSave,
    getAllMessage,
    changeStatus,

}