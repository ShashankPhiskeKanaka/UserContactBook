const errorMessages = {
    VALIDATION : {
        message : "Please provide valid data",
        status : 400
    },
    NOTFOUND : {
        message : "Resource not found",
        status : 404
    },
    EXISTS : {
        message : "Resource already exists",
        status : 400
    },
    NOTEXISTS : {
        message : "Resource not available",
        status : 404
    }
}

export { errorMessages }