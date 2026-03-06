import express from "express";
import { errorHandler } from "../../../../factory/error.factory";
import { fileFactory } from "../../../../factory/file.factory";
import { redisCache } from "../../../../factory/cache.factory";

const imagesRouter = express.Router();
const fileController = fileFactory.create();

imagesRouter.get("/", redisCache.cacheRequest(300), errorHandler.controllerWrapper(fileController.getFiles))

export { imagesRouter }