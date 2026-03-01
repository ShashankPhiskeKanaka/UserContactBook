import { fileTypeFromBuffer } from "file-type";
import type { filePgRepositoryClass } from "../repository/file/file.pgrepository";
import { serverError } from "../utils/error.utils";
import crypto from "crypto"
import path from "path";
import { mkdir, unlink } from "fs/promises";
import type { userData } from "../repository/user/user.methods";
import { logActivity } from "../utils/logging.utils";
import { errorMessages } from "../constants/errorMessages.constants";

class fileServicesClass {
    constructor ( private fileMethods : filePgRepositoryClass ) {}

    cloudinaryResponse = async (data : any) => {
        switch(data.notification_type){
            case 'upload':
                await this.fileMethods.upload(data);
                break;
            case 'delete':
                await this.fileMethods.delete(data);
                break;
            case 'moderation':
                if(data.moderation_type === "rejected") {
                    await this.fileMethods.failed(data);
                }
                break;
            default :
                throw new serverError(400, `Received unknown notification type : ${data.notification_type}`);
        }

        return;
    }
    /**
     * Orchestrates the process of uploading a file on cloudinary
     * 
     * @param data 
     * @returns 
     */

    uploadFile = async ( fileName : string, userData : userData ) => {
        // hands over the file data to generateUploadSignature method from the file repository
        const secretData = await this.fileMethods.generateUploadSignature(fileName, userData);
        logActivity.log("Secret data for uploading image to cloudinary generated");
        return secretData;
    }

    /**
     * Orchestrates the process of fetching the file data from db
     * 
     * @param id 
     * @param userData 
     * @returns 
     */
    getFile = async (id : string, userData : userData) => {
        const fileData = await this.fileMethods.getFile(id, userData);
        if(!fileData) throw new serverError(errorMessages.NOTEXISTS.status, errorMessages.NOTEXISTS.message);

        logActivity.log(`File data with the id : ${id} fetched`);
        return fileData;
    }

    /**
     * Orchestrates the process of fetching all the files data from the db
     * 
     * @param userData 
     * @returns 
     */
    getFiles = async ( userData : userData ) => {
        const filesData = await this.fileMethods.getFiles(userData);
        if(!filesData) throw new serverError(errorMessages.NOTEXISTS.status, errorMessages.NOTEXISTS.message);
        
        logActivity.log("All files data fetched");
        return filesData;
    }

    /**
     * Orchestrates the initial process of deleting a file
     * 
     * @param id 
     * @param userData 
     * @returns 
     */
    deleteFile = async ( id : string, userData : userData ) => {
        const fileData = await this.fileMethods.initiateDelete(id, userData);
        if (!fileData) throw new serverError(errorMessages.NOTEXISTS.status, errorMessages.NOTEXISTS.message);

        logActivity.log(`Deletion process initiated for file with the id : ${id}`);
        return fileData;
    }

    /**
     * Orchestrates the process of uploading the document in upload folder and the db
     * 
     * @param fileData 
     * @param userData 
     * @returns 
     */
    uploadDoc = async ( fileData : any, userData : userData ) => {
        if(!fileData) throw new serverError(400, "No file provided");

        const type = await fileTypeFromBuffer(fileData.buffer);
        const allowed = ['pdf'];

        if(!type || !allowed.includes(type.ext)) {
            throw new serverError(400, "Invalid file type");
        }

        const storedId = `${crypto.randomBytes(40).toString('hex')}.pdf`
        const userPath = path.join(`uploads`, 'users', userData.id);
        const storedPath = path.join(userPath, storedId);

        await mkdir(userPath, { recursive : true })

        const data = await this.fileMethods.uploadDoc({ ...fileData, format : type.ext, fileType : "document" }, userData, storedId, storedPath);

        logActivity.log("New document uploaded on the server");
        return data;
    }

    /**
     * Orchestrates the process of fetching the document from the db
     * 
     * @param id 
     * @param userData 
     * @returns 
     */
    getDoc = async ( id : string, userData : userData ) => {
        const docData = await this.fileMethods.getDoc(id, userData);
        if (!docData) throw new serverError(errorMessages.NOTEXISTS.status, errorMessages.NOTEXISTS.message);

        logActivity.log("Document fetched from the db");
        return docData;
    }

    /**
     * Orchestrates the process of fetching all the document records
     * 
     * @param userData 
     * @returns 
     */
    getDocs = async ( userData : userData ) => {
        const data = await this.fileMethods.getDocs(userData);
        if (!data) throw new serverError(errorMessages.NOTEXISTS.status, errorMessages.NOTEXISTS.message);

        logActivity.log("All document records fetched");
        return data;
    }

    /**
     * Orchestrates the process of deleting the document from the db and deleting it from the node server
     * 
     * @param id 
     * @param userData 
     * @returns 
     */
    deleteDoc = async ( id : string, userData : userData ) => {
        const data = await this.fileMethods.deleteDoc(id, userData);
        if (!data) throw new serverError(errorMessages.NOTEXISTS.status, errorMessages.NOTEXISTS.message);

        await unlink(path.resolve(data.storedPath));
        return data;
    }
}

export { fileServicesClass }