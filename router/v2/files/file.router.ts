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

fileRouter.get("/documents", errorHandler.controllerWrapper(fileController.getDocs));

fileRouter.post("/document", errorHandler.controllerWrapper(uploadDoc.single('myFile')), errorHandler.controllerWrapper(fileController.uploadDoc));
fileRouter.get("/document/:id", errorHandler.controllerWrapper(fileController.getDoc));
fileRouter.delete("/document", errorHandler.controllerWrapper(fileController.deleteDoc));

fileRouter.use("/profile", imageRouter);

fileRouter.use("/profiles", imagesRouter);

fileRouter.use("/document", documentRouter);

fileRouter.use("/documents", documentsRouter);

export { fileRouter };