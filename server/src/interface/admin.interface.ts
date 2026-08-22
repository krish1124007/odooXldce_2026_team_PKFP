import { Document } from "mongoose";


interface IAdmin extends Document{
    username:string;
    email:string;
    password:string;
    generateAccessToken():string;
    isPasswordCorrect(password:string):Promise<boolean>
}

export type { IAdmin }
