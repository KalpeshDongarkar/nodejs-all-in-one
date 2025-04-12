const AUTH_MODAL = require("../model/auth.model");
var jwtUtil = require('../utils/jwt.utilis')

module.exports = (app) => {
    app.use('*', async (req, res, next) => {
        let jwtChk = await jwtUtil.verifyApitoken(req, res);
        if (jwtChk?.error) {
            res.send(jwtChk)
        } else {
            next()
        }
    })

    app.get('/auth/GeneralUserInfo', (req, res) => {
        AUTH_MODAL.getUserGenInfo(req, res)
    })
}