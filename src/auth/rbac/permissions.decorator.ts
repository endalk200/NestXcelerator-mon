import { SetMetadata } from "@nestjs/common";
import { IPermissionSchema } from "./permissions";
import { Omit } from "@prisma/client/runtime/library";

export const PERMISSIONS_KEY = "permissions";
export const Permissions = (
  ...permissions: Omit<IPermissionSchema, "roles">[]
) => SetMetadata(PERMISSIONS_KEY, permissions);
