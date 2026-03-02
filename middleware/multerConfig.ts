import multer, { type FileFilterCallback } from "multer";
import { serverError } from "../utils/error.utils";
import type { Request } from "express";
import { errorMessages } from "../constants/errorMessages.constants";

const multerConfig = {
    storage: multer.memoryStorage(),
    limits: { fileSize: 3 * 1024 * 1024 }, // 3MB
    
    // 1. Change 'req' to '_req' to fix the TS(6133) error
    fileFilter: (_req: Request, file: Express.Multer.File, cb: FileFilterCallback) => {
        const allowedMime = ['application/pdf'];

        if (allowedMime.includes(file.mimetype)) {
            // 2. Success: First argument MUST be null
            cb(null, true);
        } else {
            // 3. Failure: Pass the error. 
            // Cast to 'any' if your custom serverError causes a Type mismatch with Multer's FileFilterCallback
            const error = new serverError(errorMessages.VALIDATION.status, errorMessages.VALIDATION.message);
            cb(error as any, false); 
        }
    }
};

// Create the instance
const uploadDoc = multer(multerConfig);

export { uploadDoc };
