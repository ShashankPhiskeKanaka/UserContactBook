import { errorMessages } from "../constants/errorMessages.constants";
import type { tokenPgRepositoryClass } from "../repository/token/token.pgrepository";
import type { userPgRepositoryClass } from "../repository/user/user.pgrepository"
import { authUtil } from "../utils/auth.utils";
import { serverError } from "../utils/error.utils";

/**
 * Auth service class, uses user repository and token repository which are passed in the constructor as parameters
 */
class authServicesClass {
    constructor ( private userMethods : userPgRepositoryClass, private tokenMethods : tokenPgRepositoryClass ) {}

    /**
     * Orchestrates the client login process
     * 
     * @param name 
     * @param password 
     * @returns 
     */
    login = async ( name : string, password : string ) => {
        // checks if the client exists or not using the get method of the user repository and hands over the name data
        const user = await this.userMethods.get(name);
        if(!user) throw new serverError(errorMessages.NOTFOUND.status, errorMessages.NOTFOUND.message);
        // compares the provided password from the client and the stored hash password using the comparePassword methods frm authUtil
        const flag = await authUtil.comparePassword(password, user.password);
        // if the passwords match then a refresh token is generated using the create methods from the token repository
        if(flag){
            const data = await this.tokenMethods.create(user.id ?? "", user.role ?? "");
            // created refresh token is sent to the auth controller
            return data;
        }
        // raises an error if the passwords dont match
        throw new serverError(errorMessages.VALIDATION.status, errorMessages.VALIDATION.message);
    }

    /**
     * Orchestrates the process of changing the password
     * 
     * @param password 
     * @param token 
     * @returns 
     */
    changePass = async ( password : string, token : string ) => {
        // extracts the user id from the forget token
        const { id } = authUtil.decodeForgetToken(token);
        // checks if the user with the specified id exists or not
        let user = await this.userMethods.getById(id);
        if(!user) throw new serverError(errorMessages.NOTFOUND.status, errorMessages.NOTFOUND.message);
        // generates a hashed password using hashPass module from authUtil
        const hashedPass = await authUtil.hashPass(password);
        // hands over the id and hashed password to the update method from the user repository layer
        user = await this.userMethods.update(id, hashedPass);
        // sends back the updated user to the auth controller
        return user;
    }

    /**
     * Orchestrates the forget password process
     * 
     * @param name 
     * @returns 
     */
    forgetPass = async ( name : string ) => {
        // checks if the user with the specified name exists or not
        let user = await this.userMethods.get(name);
        if(!user) throw new serverError(errorMessages.NOTFOUND.status, errorMessages.NOTFOUND.message);
        // generates a forget token with the user id using the generateForgetToken module from authUtil
        const token = authUtil.generateForgetToken(user.id ?? "");
        // sends back the forget token to auth controller
        return token;
    }

    /**
     * Orchestrates the process of creating a refresh token
     * 
     * @param token
     * @param refreshToken 
     * @returns 
     */
    refreshToken = async ( token : string, refreshToken : string ) => {
        const { id, role } = authUtil.decodeToken(token);
        const data = await this.tokenMethods.createRefreshToken(refreshToken, id, role);
        return data;
    }    

    deleteRefreshTokenUser = async ( refreshToken : string ) => {
        const data = await this.tokenMethods.get(refreshToken);        
        await this.tokenMethods.deleteRefreshTokenUser(data.userId);
        return;
    }

    deleteRefreshTokenFamily = async ( refreshToken : string ) => {
        const data = await this.tokenMethods.get(refreshToken);        
        await this.tokenMethods.deleteRefreshTokenFamily(data.familyId);
        return;
    }

}

export { authServicesClass }