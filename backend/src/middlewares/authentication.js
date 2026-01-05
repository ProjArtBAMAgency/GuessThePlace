import jwt from 'jsonwebtoken';

const secretKey = process.env.JWT_SECRET || "changeme";

export default function authenticateToken(req, res, next) {
    const tokenCookie = req.cookies['token'];

    if (tokenCookie == null) return res.status(401).json({ message: "Authentication required" });

    jwt.verify(tokenCookie, secretKey, (err, user) => {
        if (err) return res.status(403).json({ message: "Invalid token" });

        req.user = user;
        next();
    });
}