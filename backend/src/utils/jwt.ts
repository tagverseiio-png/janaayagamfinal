import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'janaayagam_super_secret_key';
const JWT_EXPIRES_IN = '24h';

export interface TokenPayload {
  id: string;
  role: string;
  type: 'citizen' | 'employee';
  category?: string;
  departmentId?: string;
  jurisdictionId?: string;
}

export const generateToken = (payload: TokenPayload): string => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
};

export const verifyToken = (token: string): TokenPayload | null => {
  try {
    return jwt.verify(token, JWT_SECRET) as TokenPayload;
  } catch (error) {
    return null;
  }
};
