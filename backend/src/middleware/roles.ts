import { Response, NextFunction } from "express";
import { AuthRequest } from "./auth";
import prisma from "../services/db";

export interface RoleRequest extends AuthRequest {
  userRole?: string;
}

export function requireRole(...roles: string[]) {
  return async (req: RoleRequest, res: Response, next: NextFunction) => {
    if (!req.userId) {
      return res.status(401).json({ error: "Not authenticated" });
    }
    try {
      const user = await prisma.user.findUnique({
        where: { id: req.userId },
        select: { role: true },
      });
      if (!user || !roles.includes(user.role)) {
        return res.status(403).json({ error: "Insufficient permissions" });
      }
      req.userRole = user.role;
      next();
    } catch {
      return res.status(500).json({ error: "Internal server error" });
    }
  };
}
