interface baseUser {
    id? : string
    name : string,
    password : string,
    role? : string,
    createdAt? : Date,
    deletedAt? : Date
}

interface userData {
    id : string,
    role : string
}

abstract class userMethodsClass {
    abstract register ( name : string, password : string, role : string ) : Promise<baseUser>;
    abstract get ( id : string ) : Promise<baseUser>;
    abstract update (id : string, password : string) : Promise<baseUser>;
    abstract delete ( id : string, password : string ) : Promise<baseUser>;
}

export { userMethodsClass }
export type { baseUser, userData }