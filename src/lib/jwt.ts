import { SignJWT, jwtVerify } from 'jose';

const SECRET_KEY = new TextEncoder().encode(
  process.env.SECRET_KEY || '7d5a57dc0d859b8d2d64016147bbcd829efbe64b21b2d41b6c7ad7fbf6ab2912'
);

export async function signAccessToken(payload: { sub: number; role: string }): Promise<string> {
  return new SignJWT({ ...payload, sub: String(payload.sub) })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('1h')
    .sign(SECRET_KEY);
}

export async function signRefreshToken(payload: { sub: number }): Promise<string> {
  return new SignJWT({ ...payload, sub: String(payload.sub) })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(SECRET_KEY);
}

export async function verifyToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, SECRET_KEY);
    return payload;
  } catch (error) {
    return null;
  }
}
