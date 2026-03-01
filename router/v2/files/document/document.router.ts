import express from "express"
import { errorHandler } from "../../../../factory/error.factory";
import { fileFactory } from "../../../../factory/file.factory";
import { uploadDocumentSchema } from "../../../../schema/files/document.schema";
import { validate } from "../../../../middleware/validate";
import { uploadDoc } from "../../../../middleware/multerConfig";
import { getImageSchema } from "../../../../schema/files/image.schema";

const documentRouter = express.Router();
const fileController = fileFactory.create();

documentRouter.post("/", errorHandler.controllerWrapper(validate(uploadDocumentSchema)), errorHandler.controllerWrapper(uploadDoc.single('myFile')),errorHandler.controllerWrapper(fileController.uploadDoc));
documentRouter.get("/:id", errorHandler.controllerWrapper(validate(getImageSchema)), errorHandler.controllerWrapper(fileController.getDoc));
documentRouter.delete("/:id", errorHandler.controllerWrapper(validate(getImageSchema)), errorHandler.controllerWrapper(fileController.deleteDoc));

export { documentRouter };