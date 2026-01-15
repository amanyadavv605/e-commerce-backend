import Redis from 'ioredis';

const redis = new Redis({
    host: "redis",
    port: 6379,
})

redis.on("connect", () => {
    console.log("Redis connected...");
});

redis.on("error", (err) => {
    console.log("Redis connection error: ", err);
});

export default redis;
