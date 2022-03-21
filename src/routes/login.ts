import express, { Router,Request,Response } from "express";
import { UserModel,UserDocument} from "../models/User";

const router:Router=express.Router()

router.post("/",function(req:Request,res:Response){
    const email:string=req.body.email
    const password:string=req.body.password

    UserModel.findOne({email:email},function(err:Error,user:UserDocument|null){
        if(!user){
            res.status(401).json({
                message:"Auth failed,could not find email"
            })
        }else{
            user.checkPassword(password,(err:Error,ismatch:Boolean)=>{
                if(!ismatch){
                    res.status(401).json({
                        message:"Username and password do not match"
                    })
                }else{
                    user.generatetoken(async(err:Error,token:string)=>{
                        await UserModel.updateOne({_id:user._id},{$set:{token:token}})
                        res.cookie("x_auth",token)
                            .status(201)
                            .send({
                                message:"Successful Login",
                                token:token
                            })
                    })
                }
              
            })
        }
    })
})

export const loginRoute=router