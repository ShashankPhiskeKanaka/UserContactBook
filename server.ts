import express from "express";
import cookieparser from "cookie-parser";
import helmet from "helmet";
import { connectDb } from "./db/db";
import { errorHandler, globalErrorHandler } from "./factory/error.factory";
import { contactRouter } from "./router/v1/contact.router";
import { v2ContactRouter } from "./router/v2/contact.router";
import { logger } from "./middleware/logger";
import { config } from "./config/env";
import { reportRouter } from "./router/v1/report.router";
import { contactsRouter } from "./router/v1/contacts.router";
import { v2ReportRouter } from "./router/v2/report.router";
import { v2ContactsRouter } from "./router/v2/contacts.router";
import { authRouter } from "./router/v2/auth.router";
import { userRouter } from "./router/v2/user.router";
import { authorize } from "./middleware/authorize";
import { cloudinaryConfig } from "./db/cloudinary";
import { fileRouter } from "./router/v2/files/file.router";

const app = express();
app.use(express.json());
app.use(cookieparser());
app.use(helmet());

cloudinaryConfig();

app.get("/", (req, res) => {
    res.send("Hello");
})

app.use(logger);
// app.use("/v1/contact", contactRouter);
// app.use("/v1/contacts", contactsRouter);
// app.use("/v1/reports", reportRouter);

app.use("/v2/auth", authRouter);
app.use("/v2/user", userRouter);
app.use("/v2/file", fileRouter);

app.use(errorHandler.controllerWrapper(authorize));
app.use("/v2/contact", v2ContactRouter);
app.use("/v2/contacts", v2ContactsRouter);
app.use("/v2/reports", v2ReportRouter);

app.use(globalErrorHandler.handleError);

app.listen(config.port, () => {
    console.log(`App running on port ${process.env.PORT}`);
})