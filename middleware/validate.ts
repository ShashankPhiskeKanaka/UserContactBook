import type { NextFunction, Request, Response } from "express";
import z from "zod";
import { logActivity } from "../utils/logging.utils";


/**
 * Validation middleware for zod schema
 * 
 * @param schema 
 * @returns 
 */
const validate = ( schema : z.ZodTypeAny ) => {
    return ( req : Request, res : Response, next : NextFunction ) => {
        // parses the request for the provided zod schema
        const result = schema.safeParse({
            body : req.body,
            cookies : req.cookies,
            params : req.params,
            query : req.query,
            file: req.file
        })
        // if the validation fails then raises an error and logs the activity
        if(!result.success) {
            console.log(`Internal Server Error : status : 400, message : ${result.error.issues[0]?.message}`)  
            logActivity.error(400, result.error.issues[0]?.message ?? "NA");          
            // sends an error response back to the client
            return res.status(400).json({
                success : false,
                message : result.error.issues[0]?.message
            })
        }
        // forwards the request if everything checks out
        next();
    }
}


export { validate };