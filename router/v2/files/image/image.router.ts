import express from "express";
import { errorHandler } from "../../../../factory/error.factory";
import { fileFactory } from "../../../../factory/file.factory";
import { validate } from "../../../../middleware/validate";
import { getImageSchema, uploadImageSchema } from "../../../../schema/files/image.schema";

const imageRouter = express.Router();
const fileController = fileFactory.create();

imageRouter.post("/:fileName", errorHandler.controllerWrapper(validate(uploadImageSchema)), errorHandler.controllerWrapper(fileController.upload));
imageRouter.get("/:id", errorHandler.controllerWrapper(validate(getImageSchema)), errorHandler.controllerWrapper(fileController.getFile));
imageRouter.delete("/:id", errorHandler.controllerWrapper(validate(getImageSchema)), errorHandler.controllerWrapper(fileController.deleteFile));

export { imageRouter }