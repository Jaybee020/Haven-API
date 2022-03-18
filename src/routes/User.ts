import express, { Router,Request,Response } from "express";
import { authenticatetoken } from "../middleware/authenticate";
import { Req } from "../middleware/authenticate";
const router:Router=express.Router()


//check if request user is authenticated
router.get("/auth", authenticatetoken, (req:Req, res:Response) => {
    res.status(200).json({
      userData: {
        id: req.user?._id,
        username: req.user?.username,
        email: req.user?.email,
      },
    });
  });