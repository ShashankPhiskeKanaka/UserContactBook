import express from "express";
import { authFactory } from "../../factory/auth.factory";
import { errorHandler } from "../../factory/error.factory";
import { validate } from "../../middleware/validate";
import { authSchema, changePassSchema, forgetSchema, loginSchema } from "../../schema/auth.schema";
import { authorize } from "../../middleware/authorize";

const authRouter = express.Router();
const authController = authFactory.create();

authRouter.post("/login", errorHandler.controllerWrapper(validate(loginSchema)), errorHandler.controllerWrapper(authController.login));

authRouter.post("/forget", errorHandler.controllerWrapper(validate(forgetSchema)), errorHandler.controllerWrapper(authController.forgetPass));
authRouter.patch("/:token", errorHandler.controllerWrapper(validate(changePassSchema)), errorHandler.controllerWrapper(authController.changePass));

authRouter.use(errorHandler.controllerWrapper(authorize));
authRouter.get("/:flag", errorHandler.controllerWrapper(validate(authSchema)), errorHandler.controllerWrapper(authController.logout));
authRouter.get("/refresh", errorHandler.controllerWrapper(validate(authSchema)), errorHandler.controllerWrapper(authController.refreshToken))

export { authRouter };