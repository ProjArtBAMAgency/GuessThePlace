import jwt from "jsonwebtoken"
import { promisify } from "util";


const secretKey = process.env.JWT_SECRET || "changeme";
const signJwt = promisify(jwt.sign);

export default function generateValidJwt(user) {
  // Generate a valid JWT which expires in 7 days.
  const exp = (new Date().getTime() + 7 * 24 * 3600 * 1000) / 1000;
  const claims = { sub: user._id.toString(), exp: exp };
  return signJwt(claims, secretKey);
}