import { UUID } from "sequelize";
import { DataTypes, Model, UUIDV4 } from "sequelize";
class Role extends Model {}

const RoleSchema = {
  role_id: {
    type: UUID,
    allowNull: false,
    defaultValue: UUIDV4(),
    primaryKey: true,
  },
  title: {
    type: DataTypes.ENUM("manager", "developer", "design", "scrum master"),
    allowNull: false,
  },
  code: {
    type: DataTypes.ENUM("3115", "2015", "2014", "2013", "2012", "2011"),
    allowNull: false,
  },
};

export { Role, RoleSchema };
