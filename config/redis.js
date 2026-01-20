import { createClient } from 'redis';


const redis = createClient({
    url: process.env.REDIS_URL
})

redis.on("connect", () => {
    console.log("Redis connected...");
});

redis.on("error", (err) => {
    console.log("Redis connection error: ", err);
});

export default redis;
