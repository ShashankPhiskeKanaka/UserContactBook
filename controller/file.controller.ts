import type { Request, Response } from "express";
import { fileServicesClass } from "../services/file.services";
import { v2 as cloudinary } from "cloudinary";
import { serverError } from "../utils/error.utils";
import path from "path";

class fileControllerClass {
    constructor (private fileServices : fileServicesClass ) {}

    /**
     * Handles the process of uploading an image file
     * 
     * @param req 
     * @param res 
     * @returns 
     */
    upload = async ( req : Request, res : Response ) => {
        // extracts the file name from the request parameter and the user data from request, passess it to uploadFile method of file services
        const data = await this.fileServices.uploadFile(req.params.fileName?.toString() ?? "", req.user);
        return res.json({
            success : true,
            data : data
        });
    }
    /**
     * Handles the process of fetching a file data from the db
     * 
     * @param req 
     * @param res 
     * @returns 
     */
    getFile = async ( req : Request, res : Response ) => {
        // extracts the file id and user data from req and hands it over to getFile method from file services
        const fileData = await this.fileServices.getFile( req.params.id?.toString() ?? "", req.user);
        return res.json({
            success : true,
            data : fileData
        })
    }

    /**
     * Handles the process of fetching all the files data
     * 
     * @param req 
     * @param res 
     * @returns 
     */
    getFiles = async ( req : Request, res : Response ) => {
        // extracts the user data from request and hands it over to the getFiles method from the file service
        const filesData = await this.fileServices.getFiles(req.user);
        return res.json({
            success : true,
            data : filesData
        })
    }

    /**
     * Handles the process of deleting a file
     * 
     * @param req 
     * @param res 
     * @returns 
     */
    deleteFile = async ( req : Request, res : Response ) => {
        // extracts the id from request parameter and user from request and hands it over to deleteFile methods from file service
        const data = await this.fileServices.deleteFile(req.params.id?.toString() ?? "", req.user);
        return res.json({
            sucess : true,
            data : data
        });
    }

    /**
     * Handles the incoming response from cloudinary after uploading the file
     * 
     * @param req 
     * @param res 
     * @returns 
     */
    cloudinaryResponse = async (req : Request, res : Response) => {

        const signature = req.headers['x-cld-signature']?.toString() ?? "";
        const timestamp = Number(req.headers['x-cld-timestamp']);
        const body = JSON.stringify(req.body);
        // validates if cloudinary has sent the request or not
        const isValid = cloudinary.utils.verifyNotificationSignature(
            body,
            timestamp,
            signature,
            7200
        )
        if(!isValid) throw new serverError(400, "Invalid request");

        // hands over the req body to cloudinaryResponse method from file services
        await this.fileServices.cloudinaryResponse(req.body);
        return res.status(200).send('ok');
    }

    /**
     * Handles the process of uploading a document on the nodejs server
     * 
     * @param req 
     * @param res 
     * @returns 
     */
    uploadDoc = async ( req : Request, res : Response ) => {
        // extracts the file and user data from the request and hands it over to the upload doc method from the file service
        const data = await this.fileServices.uploadDoc(req.file, req.user);
        return res.json({
            success : true,
            data : data
        })
    }

    /**
     * Handles the process of fetching a document from the db and the node server
     * 
     * @param req 
     * @param res 
     */
    getDoc = async ( req : Request, res : Response ) => {
        // extracts the document id and user data from the request and hands it over to getDoc method from file service
        const data = await this.fileServices.getDoc(req.params.id?.toString() ?? "", req.user);
        res.setHeader('Content-type', 'application/pdf');
        const absolutePath = path.resolve(data.storedPath);
        res.sendFile(absolutePath);
    }

    /**
     * Handles the process of fetching all the document records from the db
     * 
     * @param req 
     * @param res 
     * @returns 
     */
    getDocs = async ( req : Request, res : Response ) => {
        // extracts the user data from the request and hands it over to getDocs method from file service
        const data = await this.fileServices.getDocs(req.user);
        return res.json({
            success : true,
            data : data
        });
    }

    /**
     * Handles the process of deleting a document from the node server and record from the db
     *
     * @param req
     * @param res 
     * @returns 
     */
    deleteDoc = async ( req : Request, res : Response ) => {
        // extracts the document id and user data from the request and hands it over to deleteDoc method from file service
        const data = await this.fileServices.deleteDoc(req.params.id?.toString() ?? "", req.user);
        return res.json({
            success : true,
            data : data
        })
    }
}

export { fileControllerClass };