import type { Request, Response } from "express";
import type { userServicesClass } from "../services/user.services";

class userControllerClass {
    constructor ( private userServices : userServicesClass ) {}

    /**
     * Handles the user creation
     * 
     * @param req 
     * @param res 
     * @returns 
     */
    create = async ( req : Request, res : Response ) => {
        // extracts the name, password and role from the req.body and hands it over to the create methods from user services
        const user = await this.userServices.create(req.body.name, req.body.password, req.body.role);
        // sends the response back to the client along with the created user along with with a success = true boolean value to indicate successful creation of user
        return res.json({
            success : true,
            data : user
        });
    }

    /**
     * Handles the user soft deletion process 
     *  
     * @param req 
     * @param res 
     * @returns 
     */
    delete = async ( req : Request, res : Response ) => {
        // extracts the token from the req cookies and hands it over to the delete method from the user services
        const user = await this.userServices.delete(req.user)
        // clears the auth token and refresh token from the cookies
        res.clearCookie("token");
        res.clearCookie("refreshToken");
        // sends the response back to the client along with the soft deleted user and success = true boolean value to indicate successful deletion
        return res.json({
            success : true,
            data : user
        });
    }
}

export { userControllerClass }