import { SignJWT, jwtVerify } from 'jose';
import { nanoid } from 'nanoid';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-secret-key-change-in-production'
);

interface TokenPayload {
  userId: string;
  email: string;
  name?: string;
  provider?: string;
}

export async function generateTokens(payload: TokenPayload) {
  const accessToken = await new SignJWT({ ...payload, type: 'access' })
    .setProtectedHeader({ alg: 'HS256' })
    .setJti(nanoid())
    .setIssuedAt()
    .setExpirationTime('1h')
    .sign(JWT_SECRET);

  const refreshToken = await new SignJWT({ ...payload, type: 'refresh' })
    .setProtectedHeader({ alg: 'HS256' })
    .setJti(nanoid())
    .setIssuedAt()
    .setExpirationTime('30d')
    .sign(JWT_SECRET);

  return {
    accessToken,
    refreshToken,
    expiresIn: 3600, // 1 hour in seconds
  };
}

export async function verifyToken(token: string, type: 'access' | 'refresh' = 'access') {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    
    if (payload.type !== type) {
      throw new Error('Invalid token type');
    }

    return payload as TokenPayload & { type: string; exp: number };
  } catch (error) {
    throw new Error('Invalid token');
  }
}

export async function refreshTokens(refreshToken: string) {
  try {
    const payload = await verifyToken(refreshToken, 'refresh');
    
    // Generate new tokens
    const newTokens = await generateTokens({
      userId: payload.userId,
      email: payload.email,
      name: payload.name,
      provider: payload.provider,
    });

    return newTokens;
  } catch (error) {
    throw new Error('Invalid refresh token');
  }
}