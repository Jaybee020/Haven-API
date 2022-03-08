import express, { Router,Request,Response, NextFunction, RequestHandler } from "express";
import { UserModel,UserDocument} from "../models/User";

export interface Req extends Request{
    token?:string,
    user?:UserDocument
}

export const authenticatetoken=function(req:Req,res:Response|any,next:any){
    const token:string=req.cookies.x_auth

    UserModel.findByToken(token,(err:Error,user:UserDocument|null)=>{
        if(err){console.error(err)}
        if(!user){
            res.status(400).send({ auth: false, message: "Wrong cookie!" })
        }else{
            req.token=token
            req.user=user
            next()
        }

    })

}