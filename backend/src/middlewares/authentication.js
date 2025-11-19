import jwt from 'jsonwebtoken';

const secretKey = process.env.SECRET_KEY;

export default function authenticateToken(req, res, next) {
    const tokenCookie = req.cookies['token'];

    if (tokenCookie == null) return res.sendStatus(401);

    jwt.verify(tokenCookie, secretKey, (err, user) => {
        if (err) return res.sendStatus(403);

        req.user = user;
        next();
    });
}
