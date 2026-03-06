import { client } from "../caching/redis.client.js";
import { cacheMiddlewareClass } from "../caching/redis.middleware.js";

class cacheFactory {
    static create (cacheClient : any) {
        const cache = new cacheMiddlewareClass(cacheClient);
        return cache;
    }
}

const redisCache = cacheFactory.create(client);
export { cacheFactory, redisCache }