import express from "express";
import { contactFactory } from "../../factory/contact.factory";
import { errorHandler } from "../../factory/error.factory";
import { validate } from "../../middleware/validate";
import { createContactSchema, contactFetchSchema, contactSchema } from "../../schema/contact.schema";
import { redisCache } from "../../factory/cache.factory";

// generating instances of user router and controller
const contactRouter = express.Router();
const contactController = contactFactory.create();

// deletes an user, validates if email parameter is provided or not
contactRouter.delete("/:id" , errorHandler.controllerWrapper(validate(contactFetchSchema)) , errorHandler.controllerWrapper(contactController.deleteContact));

// updates an use, validates if data in request body is provided or not (email)
contactRouter.patch("/", errorHandler.controllerWrapper(validate(contactSchema)) ,errorHandler.controllerWrapper(contactController.updateContact));

// creates an user, validates if data in request body is provided or not ( email, phonenumber )
contactRouter.post("/", errorHandler.controllerWrapper(validate(createContactSchema)), errorHandler.controllerWrapper(contactController.createContact));

contactRouter.use(redisCache.cacheRequest(300));
// fetches an user, validates if email parameter is provided or not
contactRouter.get("/:id", errorHandler.controllerWrapper(validate(contactFetchSchema)) , errorHandler.controllerWrapper(contactController.getContact));

export { contactRouter as v2ContactRouter };