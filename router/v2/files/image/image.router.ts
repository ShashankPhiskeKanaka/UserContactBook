import express from "express";
import { errorHandler } from "../../../../factory/error.factory";
import { fileFactory } from "../../../../factory/file.factory";
import { validate } from "../../../../middleware/validate";
import { getImageSchema, uploadImageSchema } from "../../../../schema/files/image.schema";
import { redisCache } from "../../../../factory/cache.factory";

const imageRouter = express.Router();
const fileController = fileFactory.create();

imageRouter.post("/:fileName", errorHandler.controllerWrapper(validate(uploadImageSchema)), errorHandler.controllerWrapper(fileController.upload));

imageRouter.delete("/:id", errorHandler.controllerWrapper(validate(getImageSchema)), errorHandler.controllerWrapper(fileController.deleteFile));

imageRouter.use(redisCache.cacheRequest(300));
imageRouter.get("/:id", errorHandler.controllerWrapper(validate(getImageSchema)), errorHandler.controllerWrapper(fileController.getFile));

export { imageRouter }