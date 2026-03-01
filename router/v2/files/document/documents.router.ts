import express from "express"
import { fileFactory } from "../../../../factory/file.factory";
import { errorHandler } from "../../../../factory/error.factory";

const documentsRouter = express.Router();
const fileController = fileFactory.create();

documentsRouter.get("/", errorHandler.controllerWrapper(fileController.getDocs));

export { documentsRouter };