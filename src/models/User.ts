import {Schema,model,Document,Model} from "mongoose"
import bcrypt from "bcrypt"
import { sign,verify} from "jsonwebtoken"

interface User{
    username:string,
    email:string,
    password:string,
    date_created:Date,
    active:Boolean
}

export interface UserDocument extends User,Document{
    checkPassword:(password:string,cb:Function)=>Promise<void>,
    generatetoken:(cb:Function)=>Promise<void>,
    token?:string,
    deletetoken:(cb:Function)=>Promise<void>
}

export interface UserModel extends Model<UserDocument>{
    findByToken:(token:string,cb:Function)=>Promise<void>

}

const UserSchema= new Schema<UserDocument>({
    username:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true
    },
    password :{
        type:String,
    },
    date_created:{
        type:Date,
        default:Date.now
    },
    active:{
        type:Boolean,
        default:true
    }
})

//hash password before saving it to db
UserSchema.pre<UserDocument>("save",function(next){
    const user=this
    if(user.isModified("password")){
        bcrypt.genSalt(10,(err,salt)=>{
            if(err){return next(err)}
            bcrypt.hash(user.password,salt,(err,hash)=>{
                if(err){return next(err)}
                user.password=hash
                next()
            })
        })
    }
})

//compare passwords
UserSchema.methods.checkPassword=function(password:String&Buffer,cb:Function):void{
    var user=this;
    bcrypt.compare(password,user.password,function(err,isMatch){
        if(err){return cb(err)}
        console.log(isMatch)
        cb(null,isMatch)
    })
}

UserSchema.methods.generatetoken = function(cb:Function):void{
    const user=this;
    console.log(process.env.LOGIN_SECRET)
    var token =sign(user._id.toString(),String(process.env.LOGIN_SECRET))
    UserModel.findOneAndUpdate({_id:user._id},{$set:{token:token}},function(err:Error,updatedUser:UserDocument){
        if(err){console.log(err)}
        console.log(user)
        cb(null,user)
    })
    
}

UserSchema.statics.findByToken=function(token:string,cb:Function):void{
    var user=this;
    try {
        const decode=verify(token,String(process.env.LOGIN_SECRET))
        user.findOne({_id:decode,token:token},function(err:Error,user:UserDocument){
            if(err){console.error(err)}
            cb(null,user)
        })
      } catch(err) {
            cb(err,null)
      }
    
    

}

UserSchema.methods.deletetoken=function(cb:Function):void{
    var user=this
    user.updateOne({$unset:{token:""}},function(err:Error,user:UserDocument){
        cb(null,user)
    })
}

export const UserModel=model<UserDocument,UserModel>('User',UserSchema)


