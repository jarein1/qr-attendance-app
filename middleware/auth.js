import { default as jwt } from "jsonwebtoken";

const isAuth = (req, res, next) => {
    const token = req.get("Authorization").split(" ")[1];

    let decodedToken;

    try {
        decodedToken = jwt.verify(token, "secret token");
    } catch (err) {
        err.status(500);
        throw err;
    }

    if (!decodedToken) {
        const error = new Error("Not Authenticated");
        error.statusCode = 401;

        throw error;
    }

    req.userId = decodedToken.userId;

    next();
};

export { isAuth };