import { v2 as cloudinary } from "cloudinary";
import { config } from "../../config/env";
import { pool } from "../../db/postgres";
import crypto from "crypto"
import { writeFile } from "fs/promises";
import type { userData } from "../user/user.methods";
import { serverError } from "../../utils/error.utils";
import retry from "async-retry"

class filePgRepositoryClass {

    /**
     * Generates an upload signature, timestamp, public id and creates a record in the files table
     * 
     * @param data 
     * @returns 
     */
    generateUploadSignature = async (fileName : string, userData : userData) => {
        // creates a random string to act as a public_id for cloudinary
        const storedId = crypto.randomBytes(40).toString("hex");
        // folder path that the cloudinary will follow
        const folderPath = `users/${userData.id}/uploads`
        // timestamp fro cloudinary signature
        const timestamp = Math.round(new Date().getTime()/1000);
        const paramsToSign = {
            timestamp : timestamp,
            folder : folderPath,
            public_id : storedId,
            source : 'uw'
        }
        // signing the cloudinary secret to generate signature
        const signature = cloudinary.utils.api_sign_request(
            paramsToSign,
            config.file_api_secret
        )
        // storing the inital basic information about the file being uploaded to cloudinary
        await pool.query(
            `INSERT INTO files ("userId", name, "storedId", status, size, "fileType") VALUES ($1, $2, $3, $4, $5, $6)`,
            [userData.id, fileName, storedId, 'pending', 0, 'image']
        )

        return {
            signature,
            timestamp,
            api_key : config.file_api_key,
            public_id : storedId,
            folder : folderPath,
            resource_type : 'image',
            max_file_size : 3000000 // max size of file is 3mb
        }
    }

    /**
     * Updates the file record after it is successfully uploaded on cloudinary
     * 
     * @param data 
     * @returns 
     */
    upload = async (data : any) => {
        await pool.query(
            `UPDATE files SET size = $1, "fileType" = $2, "storedPath" = $3, status = 'ready', format = $4 WHERE "storedId" = $5`,
            [data.bytes, data.resource_type, data.secure_url, data.format, data.display_name]
        )

        return;
    }

    /**
     * 
     * 
     * @param id 
     * @param userData 
     * @returns 
     */
    initiateDelete = async (id : string, userData : userData) => {
        const fileData = await this.getFile(id, userData);
        const cloudinaryId = `users/${fileData.userId}/uploads/${fileData.storedId}`
        const result = await cloudinary.uploader.destroy(cloudinaryId, {
            resource_type : fileData.fileType,
            invalidate : true
        })

        return {
            fileData : fileData,
            response : result.result
        };
    }

    delete = async ( data : any ) => {
        const res = await pool.query(
            `UPDATE files SET "deletedAt" = NOW() WHERE "storedId" = $1 AND ("deletedAt" IS NULL) RETURNING *`,
            [data.resources[0].display_name]
        )

        return res.rows[0];
    }

    failed = async (data : any) => {
        await pool.query(
            `UPDATE files SET status='failed' WHERE "storedId" = $1`, [data.public_id]
        )
        return;
    }

    /**
     * Fetches a file record from the db based on its id and user
     * 
     * @param id 
     * @param userData 
     * @returns 
     */
    getFile = async (id : string, userData : userData ) => {
        const res = await pool.query(
            `SELECT * FROM files WHERE id = $1 AND ($2::uuid IS NULL OR "userId" = $2) AND ("deletedAt" IS NULL)`,
            [id, userData.id]
        )
        return res.rows[0];
    }

    /**
     * Handles the process of fetching all the files from the db
     * 
     * @param userData 
     * @returns 
     */
    getFiles = async ( userData : userData ) => {
        const res = await pool.query(
            `SELECT * FROM files WHERE ($1::uuid IS NULL OR "userId" = $1) AND ("deletedAt" IS NULL) AND ("fileType" = $2)`,
            [userData.id, "image"]
        )

        return res.rows;
    }
    /**
     * Handles the actual process of uploading the file and creating a file record in db
     * 
     * @param data 
     * @param userData 
     * @param storedId 
     * @param storedPath 
     * @returns 
     */
    uploadDoc = async (data: any, userData: userData, storedId: string, storedPath: string) => {
        
        await retry(async (bail, attempt) => {
            try {
                console.log(`Attempt ${attempt}: Writing file to ${storedPath}`);
                await writeFile(storedPath, data.buffer);
            } catch (err: any) {
                if (err.code === 'ENOENT') {
                    return bail(new serverError(400, "Upload directory does not exist on server"));
                }
                
                console.error(`Attempt ${attempt} failed: ${err.message}`);
                throw err; 
            }
        }, {
            retries: 3,
            factor: 2,
            minTimeout: 1000
        });

        // 4. Proceed to Database entry only after successful write
        const res = await pool.query(
            `INSERT INTO files ("userId", name, "storedId", "storedPath", "fileType", size, status, format) 
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
            [userData.id, data.fieldname, storedId, storedPath, data.fileType, data.size, 'ready', data.format]
        );

        return res.rows[0];
    };


    /**
     * Fetches the document record from the db
     * 
     * @param id 
     * @param userData 
     * @returns 
     */
    getDoc = async ( id : string, userData : userData ) => {
        const res = await pool.query(
            `SELECT * FROM files WHERE id = $1 AND ($2::uuid IS NULL OR "userId" = $2) AND ("deletedAt" IS NULL)`,
            [id, userData.id]
        )

        return res.rows[0];
    }

    /**
     * Performs the actual process of fetching the document records from the db
     * 
     * @param userData 
     * @returns 
     */
    getDocs = async ( userData : any ) => {
        const res = await pool.query(
            `SELECT * FROM files WHERE ($1::uuid IS NULL OR "userId" = $1) AND ("deletedAt" IS NULL) AND ("fileType" = $2)`,
            [userData.id, "document"]
        )

        return res.rows;
    }

    /**
     * performs the action of soft deleting the document record from the db
     * 
     * @param id 
     * @param userData 
     * @returns 
     */
    deleteDoc = async (id : string, userData : any) => {
        const res = await pool.query(
            `UPDATE files SET "deletedAt" = NOW() WHERE (id = $1) AND ($2::uuid IS NULL OR "userId" = $2) AND ("deletedAt" IS NULL) RETURNING *`,
            [id, userData.id]
        )
        return res.rows[0]
    }
}

export { filePgRepositoryClass }