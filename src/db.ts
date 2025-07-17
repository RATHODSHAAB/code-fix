import mongoose from "mongoose";
import { required } from "zod/v4/core/util.cjs";

mongoose.connect("mongodb://localhost:27017/UserData")
.then(()=> {
    console.log("Successfully connected")
})
.catch((err: any) => {
    console.error("Didnot connected",err)
})

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        maxLength: 20,
        minLength:3,
        trim: true,
        unique: true,
        required: true
    },
    
    email:{
        type:String,
        required: true,
        unique: true,
        trim:true
    },
    password:{
        type:String,
        required: true,
        minLength : 6,
    },
     role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user',
        required: true,
    }
   
  
})


const adminSchema = new mongoose.Schema({
    username: {
        type: String,
        maxLength: 20,
        minLength:3,
        trim: true,
        unique: true,
        required: true
    },
    
    email:{
        type:String,
        required: true,
        unique: true,
        trim:true
    },
    password:{
        type:String,
        required: true,
        minLength : 6,
    },
    role:{
        type:String,
        required:true,
        trim: true,
    }
})




export const User = mongoose.model("User", userSchema);
export const Admin =  mongoose.model("Admin" , adminSchema);

module.exports = {
    User,
    Admin
}