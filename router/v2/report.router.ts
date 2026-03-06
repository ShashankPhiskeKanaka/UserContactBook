import express from "express"
import { reportFactory } from "../../factory/report.factory";
import { errorHandler } from "../../factory/error.factory";
import { validate } from "../../middleware/validate";
import { authSchema } from "../../schema/auth.schema";
import { redisCache } from "../../factory/cache.factory";

const reportRouter = express.Router();

const reportController = reportFactory.create();

reportRouter.use(redisCache.cacheRequest(300));
reportRouter.get("/contact-stats", errorHandler.controllerWrapper(validate(authSchema)), errorHandler.controllerWrapper(reportController.report));

export { reportRouter as v2ReportRouter };