import { DataTypes, Model } from "sequelize";
import { connInstance } from "../db/configParams";
import { UUID, UUIDV4 } from "sequelize";
class User extends Model {}

const UserSchema = {
  user_id: {
    type: UUID,
    allowNull: false,
    defaultValue: UUIDV4(),
    primaryKey: true,
  },
  first_name: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  last_name: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true,
  },
  user_type: {
    type: DataTypes.ENUM("3115", "3110"),
    allowNull: false,
  },

  hashed_password: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  is_verified: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
  },
};

class RefreshToken extends Model {
  public id!: number;
  public token!: string;
  public userId!: number;
}
const RefreshTokenSchema = {
  refreshToken_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false,
  },
  refresh_token: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
};

export { User, UserSchema, RefreshToken, RefreshTokenSchema };
