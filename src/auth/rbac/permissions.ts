export type Action = "create" | "read" | "update" | "delete";
export type Ownership = "own" | "any";
export type Role = "USER" | "ADMIN";

export interface IPermissionSchema {
  roles: Role[];
  resource: string;
  action: `${Action}:${Ownership}`;
}

export const permissionSchema: IPermissionSchema[] = [
  { roles: ["ADMIN", "USER"], resource: "User", action: "read:own" },
  { roles: ["ADMIN", "USER"], resource: "User", action: "create:own" },
  { roles: ["ADMIN", "USER"], resource: "User", action: "update:own" },
  { roles: ["ADMIN", "USER"], resource: "User", action: "delete:own" },
  { roles: ["ADMIN", "USER"], resource: "RefreshToken", action: "read:own" },
  { roles: ["ADMIN", "USER"], resource: "RefreshToken", action: "create:own" },
  { roles: ["ADMIN", "USER"], resource: "RefreshToken", action: "update:own" },
  { roles: ["ADMIN", "USER"], resource: "RefreshToken", action: "delete:own" },
];
