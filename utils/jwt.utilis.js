const jwt = require('jsonwebtoken');
var redis = require('redis');
const { promisify } = require("util");
const database = require('../config/database.keys')

const redisClient = redis.createClient(database.redisConfig);
const redisKeyExpirySec = 600;
const redisExistsAsync = promisify(redisClient.exists).bind(redisClient);
const redisGetAsync = promisify(redisClient.get).bind(redisClient);
const redisSetAsync = promisify(redisClient.set).bind(redisClient);
const redisDelAsync = promisify(redisClient.del).bind(redisClient);
const redisExpireAsync = promisify(redisClient.expire).bind(redisClient);

module.exports.generateToken = async (usrSet) => {
    if (await redisExistsAsync(`${usrSet.username}`)) {
        let token = await redisGetAsync(`${usrSet.username}`)
        if (token) {
            let data = JSON.parse(token)
            let decoded;
            try {
                decoded = jwt.verify(data.token, database.SECRET_KEY);
            } catch (err) {
                decoded = null;
                await redisDelAsync(`${usrSet.username}`)
            } finally {
                if (decoded) {
                    const currentTime = Math.floor(Date.now() / 1000)
                    const remainingTime = decoded.exp - currentTime;
                    jtkn = {
                        "data": {
                            "access_tken": data.token,
                            "type": "Bearer",
                            "expires_in": remainingTime
                        }
                    }
                } else {
                    jtkn = await this.generateToken(usrSet)
                }
            }
        }
    } else {
        const token = jwt.sign({ username: `${usrSet.username}|${usrSet.password}` }, database.SECRET_KEY, { expiresIn: '20m' });
        await redisSetAsync(`${usrSet.username}`, JSON.stringify({ token: token, expiresIn: redisKeyExpirySec }))
        await redisExpireAsync(`appfltr_action`, redisKeyExpirySec);
        jtkn = {
            "data": {
                "access_tken": token,
                "type": "Bearer",
                "expires_in": redisKeyExpirySec
            }
        }

    }
    return jtkn;
}

module.exports.verifyApitoken = async (req, res) => {
    var tokens = req.headers
    if (tokens.authorization) {
        let authSString = tokens.authorization
        if (authSString && authSString != '') {
            let strSplit = [] = tokens.authorization.split(' ')
            let js;
            if ((/Bearer/).test(strSplit[0])) {
                jwt.verify(strSplit[1], database.SECRET_KEY, function (err, payload) {
                    if (err) {
                        js = { "error": "Unauthorized" };
                    } else {
                        js = { "status": "Authenticated" };
                    }
                });
                res.setHeader('Authorization', strSplit[1]);
                return js;
            } else {
                return { "error": "Invalid Auth Type" }
            }
        } else {
            return { "error": "Unauthorized" }
        }
    } else {
        return { "error": "Unauthorized" }
    }
    // jwt.verify(data.token, database.SECRET_KEY);
}