import { RoleSchema, Role } from "./jobRoleModel";
import {
  User,
  RefreshToken,
  UserSchema,
  RefreshTokenSchema,
} from "./userModel";

import { Sequelize } from "sequelize";

let UserModel: typeof User,
  RefreshTokenModel: typeof RefreshToken,
  RoleModel: typeof Role;

export function defineModels(sequelize: Sequelize) {
  UserModel = User.init(UserSchema, {
    sequelize,
    tableName: "users",
  });
  RefreshTokenModel = RefreshToken.init(RefreshTokenSchema, {
    sequelize,
    tableName: "refreshToken",
  });
  RoleModel = Role.init(RoleSchema, {
    sequelize,
    tableName: "job_role",
  });

  UserModel.hasMany(RefreshTokenModel, {
    foreignKey: "user_id",
    as: "refresh_tokens",
    onDelete: "CASCADE",
  });
  UserModel.hasOne(RoleModel, {
    foreignKey: "user_id",
    onDelete: "CASCADE",
  });
  RefreshTokenModel.belongsTo(UserModel, {
    foreignKey: "user_id",
    onDelete: "NO ACTION",
    onUpdate: "NO ACTION",
  });
  RoleModel.belongsTo(UserModel, {
    foreignKey: "user_id",
    onDelete: "NO ACTION",
    onUpdate: "NO ACTION",
  });

  return {
    UserModel,
    RefreshTokenModel,
    RoleModel,
  };
}

export { UserModel, RefreshTokenModel, RoleModel };
