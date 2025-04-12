var jwtUtil = require('../utilities/jwt-token.utils')

module.exports = (app) => {

    app.post('/auth/LoginUser', async (req, res) => {
        let request = req.body
        let jtkn = {}
        if (Buffer.from(request.username, 'base64').toString() == "viapiuser1" && Buffer.from(request.password, 'base64').toString() == "vi@12%apiSet") {
            jtkn = await jwtUtil.generateToken(request);
            res.send(jtkn)
        } else {
            res.send({
                "error_description": "You are not authorized to access this resource.",
                "error": "invalid_access"
            })
        }
    })
}