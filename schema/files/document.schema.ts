import z, { file } from "zod";

const fileUploadSchema = z.object({
  fieldname: z.string(),     // Multer uses lowercase 'n'
  originalname: z.string(),
  encoding: z.string(),
  mimetype: z.string().refine((val) => val === 'application/pdf', {
    message: "Only PDF files are allowed",
  }),
  size: z.number().max(3 * 1024 * 1024, "File size must be less than 3MB"),
  // Use z.instanceof(Buffer) for Node.js file buffers
  buffer: z.instanceof(Buffer).optional(), 
});


const uploadDocumentSchema = z.object({
    file : fileUploadSchema
})

export { uploadDocumentSchema }