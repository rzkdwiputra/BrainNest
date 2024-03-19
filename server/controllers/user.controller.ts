require('dotenv').config();
import userModel from "../models/user.model"
import ErrorHandler from "../utils/ErrorHandler"
import { CatchAsyncError } from "../middleware/catchAsyncErrors"
import { Request,Response,NextFunction } from "express"
import jwt, { Secret } from "jsonwebtoken"
import ejs from "ejs";
import path from "path";
import sendMail from "../utils/sendMail"

// register user
interface IRegistrationBody{
    name: string;
    email: string;
    password: string;
    avatar?: string;
}

export const registrationUser = CatchAsyncError(async(req:Request, res:Response, next:NextFunction) => {
    try{
        const{name,email,password} = req.body;

        const isEmailExist = await userModel.findOne({email});
        if(isEmailExist){
            return next(new ErrorHandler("Email already exist",400))
        };

        const user:IRegistrationBody = {
            name,
            email,
            password,
        };

        const activationToken = createActivationToken(user);
    
        const activationCode = activationToken.activationCode;

        const data = {user: {name:user.name}, activationCode};
        const html = await ejs.renderFile(path.join(__dirname, "../mails/activation-mails.ejs"))
    
        try{
            await sendMail({
                email:  user.email, 
                subject:"Active your account!",
                template:"activation-mail.ejs",
                data,
            });

            res.status(201).json({
                success:true,
                message:"Please check your email: "+user.email+" to active your account.",
                activationToken: activationToken.token,
            });
        } catch (error:any){
            return next(new ErrorHandler(error.message,400));
        }
        
    }
    catch (error:any){
        return next(new ErrorHandler(error.message,400));
    }
});

interface IActivationToken{
    token: String;
    activationCode: string;
}

export const createActivationToken = (user:any): IActivationToken => {
    const activationCode = Math.floor(1000 + Math.random() * 9000).toString();

    const token = jwt.sign({
        user,activationCode
    },process.env.ACTIVATION_SECRET as Secret,{
        expiresIn:"5m",
    });
    
    return {token,activationCode};
}