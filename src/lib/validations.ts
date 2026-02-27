import { z } from "zod";

export const createVaultSchema = z.object({
  name: z
    .string()
    .min(1, "Vault name is required")
    .max(100, "Vault name must be 100 characters or less"),
});

export const createKeySchema = z.object({
  service: z.string().min(1, "Service name is required"),
  keyName: z.string().min(1, "Key name is required"),
  value: z.string().min(1, "Value is required"),
  project: z.string().optional(),
  notes: z.string().optional(),
});

export const updateKeySchema = z.object({
  service: z.string().min(1).optional(),
  keyName: z.string().min(1).optional(),
  value: z.string().min(1).optional(),
  project: z.string().nullable().optional(),
  notes: z.string().nullable().optional(),
});

export type CreateVaultInput = z.infer<typeof createVaultSchema>;
export type CreateKeyInput = z.infer<typeof createKeySchema>;
export type UpdateKeyInput = z.infer<typeof updateKeySchema>;
