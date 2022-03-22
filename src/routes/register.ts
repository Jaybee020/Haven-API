import express, { Router,Request,Response } from "express";
import { UserModel,UserDocument} from "../models/User";
import nodemailer from "nodemailer"
import { JwtPayload, sign,verify} from "jsonwebtoken"
import { Options, SingleKeyOptions } from "nodemailer/lib/dkim";
import { authenticatetoken } from "../middleware/authenticate";
const router:Router=express.Router()
export const EMAIL_SENT_FROM = "olayinkaganiyu1@gmail.com"

interface decodedToken extends JwtPayload{
    username:string,
    password:string,
    email:string
}

// export let transporter = nodemailer.createTransport({
//     service: 'gmail',
//     auth: {
//       user: process.env.APP_EMAIL,
//       pass: process.env.APP_EMAIL_PASS,
//     },
//   });

router.get("/",function(req:Request,res:Response){
    res.status(200).send("Welcome to register page")
})

router.post("/",async function(req:Request,res:Response){
    const username:string=req.body.username
    const email:string=req.body.email.toLowerCase()
    const password:string=req.body.password
    
    if(username.length<4){
        res.status(400).send({
            message:"The username is too short"
        })
    }
    const existingUser:UserDocument|null=await UserModel.findOne({$or: [{ email:email }, { username: username}]})  
    if(existingUser?.username==username){
        res.status(400).send({
            message:"This username is already in use"
        })
    }
    else if(existingUser?.email==email){
        res.status(400).send({
            message:"This email is already in use"
        })
    }else{
        UserModel.create({
            username:username,
            email:email,
            password:password
        },function(err,newUser:UserDocument){
            if(err){
                res.status(400).json({
                    message:"Could not create new user"
                })
            }
            res.status(200).send({
                message:"Your account was succesfully created"
            })
        })
    }

    // var activationToken = sign(
    //     { email, password, username },
    //     String(process.env.ACTIVATION_SECRET),
    //     { expiresIn: "20m" }
    //   );

    // let mailOptions={
    //     from:EMAIL_SENT_FROM,
    //     to: email,
    //     subject: "Click link to activate account",
    //       html: `<h2>Here's your activation link!</h2>
    //       <a href="${process.env.CLIENT_URL}/login?activate=${activationToken}">${process.env.CLIENT_URL}/login?activate=${activationToken}</a>
    //       <p>Thank you for creating an account with <your app name> 😄 For security reasons, this link will expire within 20 mins! </p>`,
    //     };

    // transporter.sendMail(mailOptions,function(err, info){
    //     if (err) {
    //         res.json(err);
    //     } else {
    //         res.json(info);
    //     }
    //     });

    
       
})


router.post("/activateUser",async function(req:Request,res:Response){
    var token:string|undefined=req.body.activationToken
    if(token){
        try {
            const decoded:decodedToken=<decodedToken>verify(token,String(process.env.ACTIVATION_SECRET));
            const { email, password, username } = decoded;
            const existingUser:UserDocument|null=await UserModel.findOne({$or: [{ email:email }, { username: username}]})  
            if(existingUser?.username==username){
                res.status(400).send({
                    message:"The user with username "+existingUser.username +" is already in use"
                })
            }
            else if(existingUser?.email==email){
                res.status(400).send({
                    message:"The user with username "+existingUser.email +" is already in use"
                })
            }else{
                UserModel.create({
                    username:username,
                    email:email,
                    password:password
                },function(err,newUser:UserDocument){
                    if(err){
                        res.status(400).json({
                            message:"Could not create new user"
                        })
                    }
                    res.status(200).send({
                        message:"Successfully created new account",
                        user:newUser
                    })
                })
            }
            
          } catch(err) {
            res
          .status(400)
          .json({ message: "Incorrect/Expired Link, try signing up again" });
          }
       
    }


})

export const registerRoute=router