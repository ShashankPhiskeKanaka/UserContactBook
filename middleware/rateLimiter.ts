import { rateLimit } from "express-rate-limit";
import { RedisStore } from "rate-limit-redis";
import { client } from "../caching/redis.client.js";
import type { NextFunction, Request, Response } from "express";

const rateLimiter = rateLimit({
    store : new RedisStore({
        sendCommand: (...args: []) => client.sendCommand(args),
        prefix : 'v1:ratelimit:',        
    }),

    windowMs: 15 * 60 * 1000,
    max : 100,
    keyGenerator : (req : Request) => {
        return req.headers['x-api-key']?.toString() || req.ip || "anonymous";
    },

    validate : { xForwardedForHeader: false, default : false },

    handler: (req : Request, res : Response, next : NextFunction) => {
        res.status(429).json({
            error : "Too many requests",
            message : "You have exceeded the request limit"
        });
    },

    standardHeaders : true,
    legacyHeaders : false
});

export { rateLimiter }