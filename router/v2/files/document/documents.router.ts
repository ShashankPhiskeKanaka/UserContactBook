import express from "express"
import { fileFactory } from "../../../../factory/file.factory";
import { errorHandler } from "../../../../factory/error.factory";
import { redisCache } from "../../../../factory/cache.factory";

const documentsRouter = express.Router();
const fileController = fileFactory.create();

documentsRouter.get("/", redisCache.cacheRequest(300), errorHandler.controllerWrapper(fileController.getDocs));

export { documentsRouter };