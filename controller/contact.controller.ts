import type { Request, Response } from "express";
import { contactSerializer } from "../serializer/contact.serializer";

import requestIp from "request-ip";
import type { contactPgServicesClass } from "../services/contact.pgservices";
import { authUtil } from "../utils/auth.utils";

class contactControllerClass {
    constructor ( private contactService : contactPgServicesClass ) {} // service class passed in as parameter to the constructor

    /**
     * Handles the process of creation of a contact
     * 
     * @param req 
     * @param res 
     * @returns 
     */
    createContact = async ( req : Request, res : Response ) => { 
        // extracts the data from req.body and token from req.cookies and hands them over to the contact services
        const contact = await this.contactService.createContact(req.body, req.cookies.token);
        // serialized the returned contact from the service layer
        const data = contactSerializer.serialize(contact);
        // sends back a response the client along with the contact and a success value
        authUtil.invalidateKey(req.user.id, "contact");

        return res.status(201).json({
            success : true,
            data : data
        });
    }

    /**
     * Handles the process of fetching a contact
     * 
     * @param req 
     * @param res 
     * @returns 
     */
    getContact = async ( req : Request, res : Response ) => {
        // extracts the contact id from the req parameters and type casts it into a string value
        const id = req.params?.id?.toString() ?? "";
        // hands over the extracted id along with the token from the req.cookies to the contact service layer
        const contact = await this.contactService.get(id, req.cookies.token);
        // serializes the returned contact from the service layer
        const data = contactSerializer.serialize(contact);
        // sends a response back to cient along with fetched contact and a success value
        return res.json({
            success : true,
            data : data
        });
    }

    /**
     * Handles the process of fetching all contacts
     * 
     * @param req 
     * @param res 
     * @returns 
     */
    getAllContacts = async ( req : Request, res : Response ) => {
        // extracts the cursor, limit, search and sort fields from the req queries
        // performs necessary type casting into string or integer value and defines default values
        const cursor = req.query.cursor?.toString() ?? undefined;
        const limit = req.query.limit? parseInt(req.query.limit as string, 10): undefined;
        const search = req.query.search?.toString() ?? undefined;
        const sort = req.query.sort?.toString() ??  undefined;
        // hands over the extracted queries to the contact service layer along with token from req cookies
        const data = await this.contactService.getAll(limit, cursor , search, sort, req.cookies.token);
        // sends a reponse back to the client along with with the contacts, nextCursor for pageination and a success value
        return res.json({
            success : true,
            nextCursor : data.nextCursor,
            data : data.contacts
        });
    }

    /**
     * Handles the process of updating a contact
     * 
     * @param req 
     * @param res 
     * @returns 
     */
    updateContact = async ( req : Request, res : Response ) => {
        // extracts the ip address of the client for audit logs
        const ip = requestIp.getClientIp(req);
        // hands over the data from req.body, the ip address and the token from req.cookies to the contact service layer
        const contact = await this.contactService.update(req.body, ip ?? "", req.cookies.token);
        // serializes the returned updated contact
        const data = contactSerializer.serialize(contact);
        // sedns back a response to the client along with the updated contact data and a success value
        authUtil.invalidateKey(req.user.id, "contact");
        return res.json({
            success : true,
            data : data
        });
    }

    /**
     * Handles the deletion process of the contact
     * 
     * @param req 
     * @param res 
     * @returns 
     */
    deleteContact = async ( req : Request, res : Response ) => {
        // extracts the contact id from the req parameters
        const id = req.params?.id?.toString() ?? "";
        // extracts the request ip for audit logs
        const ip = requestIp.getClientIp(req);
        // hands over the id, ip and the token from the req.cookie to the contact service layer
        const contact = await this.contactService.delete(id, ip ?? "", req.cookies.token);
        // serializes the returned deleted contact
        const data = contactSerializer.serialize(contact);
        authUtil.invalidateKey(req.user.id, "contact");
        // sends a response back to the client along with the deleted contact and a success value
        
        return res.json({
            success : true,
            data : data
        });
    }

    // getDeletedContacts = async ( req : Request, res : Response ) => {
    //     const contacts = await this.contactService.getDeleted();
    //     return res.json({
    //         success : true,
    //         data : contacts
    //     });
    // }
}

export { contactControllerClass }