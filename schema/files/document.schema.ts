import z, { file } from "zod";

const fileUploadSchema = z.object({
    fieldName : z.string(),
    originalname : z.string(),
    encoding : z.string(),
    mimetype : z.string(),
    size : z.number().max(3 * 1024 * 1024, "File size must be lest than 3mb"),
    buffer : z.string().optional(),
});

const uploadDocumentSchema = z.object({
    file : fileUploadSchema
})

export { uploadDocumentSchema }