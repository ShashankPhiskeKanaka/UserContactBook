import express from "express";
import { errorHandler } from "../../../../factory/error.factory";
import { fileFactory } from "../../../../factory/file.factory";

const imagesRouter = express.Router();
const fileController = fileFactory.create();

imagesRouter.get("/", errorHandler.controllerWrapper(fileController.getFiles))

export { imagesRouter }