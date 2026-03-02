import type { NextFunction, Request, Response } from "express";
import { authUtil } from "../utils/auth.utils";
import { serverError } from "../utils/error.utils";
import { errorMessages } from "../constants/errorMessages.constants";

/**
 * Middleware to check if the client is authorized or not
 * 
 * @param req 
 * @param res 
 * @param next 
 */

const authorize = async (req : Request, res : Response, next : NextFunction) => {
    // checks if access and refresh token are available in the cookies or not
    if(!req.cookies?.token || !req.cookies?.refreshToken) throw new serverError(errorMessages.UNAUTHORIZED.status, errorMessages.UNAUTHORIZED.message);
    // hands over the access token to the decodeToken module from authUtil to get the id and role from the token
    const { id, role } = authUtil.decodeToken(req.cookies.token);
    // if id and role are not decoded then throws an error
    if(!id || !role) throw new serverError(400, "Please login");
    // forwards the request if everything checks out
    req.user = { id, role };
    next();
}

export { authorize }