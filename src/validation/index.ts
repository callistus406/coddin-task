import joi from "joi";
import { ValidateLoginData, ValidateRedData } from "./types";

class Validation {
  public data: object;
  constructor(data: object) {
    this.data = data;
  }
}

class RegistrationValidator extends Validation {
  constructor(validationInfo: ValidateRedData) {
    super(validationInfo);
  }

  schema() {
    return joi.object({
      firstName: joi.string().min(2).max(100),
      lastName: joi.string().min(2).max(100),

      email: joi
        .string()
        .email({
          minDomainSegments: 2,
          tlds: { allow: ["com", "net", "uk", "org", "ng"] },
        })
        .required(),
      password: joi
        .string()
        .pattern(
          new RegExp(
            "^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$"
          )
        )
        .min(8)
        .max(30)
        .required()
        .label("Password")
        .messages({
          "string.empty": ` password field cannot be empty `,
          "object.regex": "Must have at least 8 characters",
          "string.pattern.base":
            "Minimum eight characters,at least one upper case,one lower case letter , one digit and  one special character,",
        }),
    });
  }

  validate() {
    let validateSchema = this.schema();
    return validateSchema.validate(this.data);
  }
}

class LoginValidator extends Validation {
  constructor(validationInfo: ValidateLoginData) {
    super(validationInfo);
  }

  schema() {
    return joi.object({
      email: joi
        .string()
        .email({
          minDomainSegments: 2,
          tlds: { allow: ["com", "net", "uk", "org", "ng"] },
        })
        .required(),
      password: joi
        .string()
        .pattern(
          new RegExp(
            "^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$"
          )
        )
        .min(8)
        .max(30)
        .required()
        .label("Password")
        .messages({
          "string.empty": ` password field cannot be empty `,
          "object.regex": "Must have at least 8 characters",
          "string.pattern.base":
            "Minimum eight characters,at least one upper case,one lower case letter , one digit and  one special character,",
        }),
    });
  }

  validate() {
    let validateSchema = this.schema();
    return validateSchema.validate(this.data);
  }
}

export { RegistrationValidator, LoginValidator };
