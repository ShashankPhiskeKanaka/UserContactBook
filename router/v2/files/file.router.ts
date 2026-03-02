import express from "express"
import { fileFactory } from "../../../factory/file.factory";
import { errorHandler } from "../../../factory/error.factory";
import { authorize } from "../../../middleware/authorize";
import { uploadDoc } from "../../../middleware/multerConfig";
import { imageRouter } from "./image/image.router";
import { documentRouter } from "./document/document.router";
import { imagesRouter } from "./image/images.router";
import { documentsRouter } from "./document/documents.router";

const fileRouter = express.Router();
const fileController = fileFactory.create();

fileRouter.post("/cloudinary", errorHandler.controllerWrapper(fileController.cloudinaryResponse));
fileRouter.use(errorHandler.controllerWrapper(authorize))

fileRouter.use("/profile", imageRouter);

fileRouter.use("/profiles", imagesRouter);

fileRouter.use("/document", documentRouter);

fileRouter.use("/documents", documentsRouter);

export { fileRouter };