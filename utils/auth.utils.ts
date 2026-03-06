import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import { config } from "../config/env"
import { serverError } from "./error.utils"
import type { Request } from "express"
import { client } from "../caching/redis.client"
import { logActivity } from "./logging.utils"

/**
 * auth utils 
 */
class authUtilsClass {
    /**
     * Handles the process of decoding an access token
     * 
     * @param token 
     * @returns 
     */
    decodeToken = (token : string) => {
        // encapsulated in a try catch block, it uses veridfy methods from jsonwebtoken package
        try{
            return jwt.verify(token , config.secret as string) as { id : string, role : string }
        }catch (err) {
            throw new serverError(400, "Invalid token provided");
        }
    }
    /**
     * generates an access token
     * 
     * @param id 
     * @param role 
     * @returns 
     */

    generateToken = ( id : string, role : string ) => {
        // embeds the user id and role into the token and provides an expiration date 
        return jwt.sign( { id, role }, config.secret as string, { expiresIn : "1d" } );
    }

    /**
     * Decodes a forget password token
     * 
     * @param token 
     * @returns 
     */
    decodeForgetToken = ( token : string ) => {
        // embedded in a try catch block uses verify method from the jsonwebtoken package to decode the id from the token
        try{
            return jwt.verify(token, config.secret as string) as { id : string }
        }catch (err) {
            throw new serverError(400, "Invalid token provided");
        }
    }

    /**
     * Generates a forget password token
     * 
     * @param id 
     * @returns 
     */
    generateForgetToken = ( id : string ) => {
        // embeds the client id into the token along with an expiration time
        return jwt.sign({ id }, config.secret as string, { expiresIn : "15m" });
    }

    /**
     * Compares the client provided password along with the hashed password
     * 
     * @param password 
     * @param hashPass 
     * @returns 
     */
    comparePassword = async ( password : string, hashPass : string ) => {
        // uses compare method from the bcrypt package
        return await bcrypt.compare(password, hashPass);
    }

    /**
     * Hashes a normal string password
     * 
     * @param password 
     * @returns 
     */
    hashPass = async ( password : string ) => {
        // hashes the password using hash method from the bcrypt package along with salt value
        return await bcrypt.hash(password, 10);
    }

    /**
     * defines the id if the role is user or admin
     * 
     * @param token 
     * @returns 
     */
    defineId = (token : string) => {
        const { id, role } = this.decodeToken(token);
        let userId = undefined;
        if(role == "user"){
            userId = id;
        }

        return userId;
    }

    generateKey = ( req: Request ) => {
        const userId = req.user?.id || 'public';
        const resource = req.baseUrl.split("/").pop() || 'global';

        const sortedQuery = Object.keys(req.query).sort().map(key => `${key.toLowerCase()}=${String(req.query[key]).toLowerCase()}`)
        .join('&');

        const path = req.path.replace(/\/$/, "");

        return `v1:cache:${userId}:${resource}:${path}${sortedQuery ? "?" + sortedQuery : ""}`;
    }

    invalidateKey = async ( userId: string, resource: string ) => {

        const pattern = `v1:cache:${userId}:${resource}:*`

        try{
            if(!pattern.includes("*")){
                await client.del(pattern);
                return;
            }

            const keys: string[] = [];

            for await (const key of client.scanIterator({
                MATCH : pattern,
                COUNT : 100
            })) {
                keys.push(...key);
            }
            if(keys.length > 0) {
                await client.del(keys);
            }
            logActivity.log(`${resource} cache cleared`);
        }catch (err : any) {
            throw new serverError(err.status, err.message);
        }
    }
}

const authUtil = new authUtilsClass();
export { authUtil };