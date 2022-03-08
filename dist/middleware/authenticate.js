import { UserModel } from "../models/User";
export const authenticatetoken = function (req, res, next) {
    const token = req.cookies.x_auth;
    UserModel.findByToken(token, (err, user) => {
        if (err) {
            console.error(err);
        }
        if (!user) {
            res.status(400).send({ auth: false, message: "Wrong cookie!" });
        }
        else {
            req.token = token;
            req.user = user;
            next();
        }
    });
};
