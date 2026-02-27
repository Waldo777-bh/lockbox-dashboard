import { Prisma } from "@prisma/client";
import { db } from "./db";

export const AuditAction = {
  VAULT_CREATED: "VAULT_CREATED",
  VAULT_UPDATED: "VAULT_UPDATED",
  VAULT_DELETED: "VAULT_DELETED",
  VAULT_EXPORTED: "VAULT_EXPORTED",
  KEY_ADDED: "KEY_ADDED",
  KEY_UPDATED: "KEY_UPDATED",
  KEY_DELETED: "KEY_DELETED",
  KEY_DECRYPTED: "KEY_DECRYPTED",
  API_KEY_CREATED: "API_KEY_CREATED",
  API_KEY_REVOKED: "API_KEY_REVOKED",
} as const;

export type AuditActionType = (typeof AuditAction)[keyof typeof AuditAction];

export async function createAuditLog(params: {
  action: AuditActionType;
  userId: string;
  service?: string;
  keyName?: string;
  metadata?: Record<string, unknown>;
}) {
  await db.auditLog.create({
    data: {
      action: params.action,
      userId: params.userId,
      service: params.service,
      keyName: params.keyName,
      metadata: params.metadata
        ? (params.metadata as Prisma.InputJsonValue)
        : undefined,
    },
  });
}
