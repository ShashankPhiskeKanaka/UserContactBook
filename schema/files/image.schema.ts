import z from "zod"

const uploadImageSchema = z.object({
    params : z.object({
        fileName : z.string({ error : "Please provide a file name" }).trim()
    }) 
})

const getImageSchema = z.object({
    params : z.object({
        id : z.string({ error : "Please provide file id" }).trim()
    })
})

export { uploadImageSchema, getImageSchema }