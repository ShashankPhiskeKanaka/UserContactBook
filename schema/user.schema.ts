import z from "zod"

const createUserSchema = z.object({
    body : z.object({
        name : z.string({ error : "Please provide a name" }).trim(),
        password : z.string({ error : "Please provide a password" }).trim().regex(/^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/, { error : "Please provide a valid password" })
    })
})

const updateUserSchema = z.object({
    body : z.object({
        name : z.string().optional(),
        email : z.string().optional(),
    })
})

export { createUserSchema, updateUserSchema }