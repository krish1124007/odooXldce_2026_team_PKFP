import type { Response } from "express";

class ApiResponse{
    constructor(
        public statusCode: number,
        public message: string,
        public data: any
    ){
        this.statusCode = statusCode
        this.message = message
        this.data = data
    }
}


function returnResponse(res:Response,statusCode:number,message:string,data:any){
    return res.status(statusCode).json(
        new ApiResponse(statusCode,message,data)
    )
}

export {returnResponse}
