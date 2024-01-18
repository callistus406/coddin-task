import bcrypt from "bcrypt";

class Password {
  protected saltRounds: number;
  protected password: string;

  constructor(password: string) {
    this.saltRounds = 10;
    this.password = password;
  }
}

class HashPassword extends Password {
  constructor(password: string) {
    super(password);
  }

  async hash(): Promise<string> {
    const hashedPassword = await bcrypt.hash(this.password, this.saltRounds);
    return hashedPassword;
  }
}

class UnHashPassword extends Password {
  protected hashPassword: string;

  constructor(plainPassword: string, hashedPassword: string) {
    super(plainPassword);
    this.hashPassword = hashedPassword;
  }

  async comparePassword(): Promise<boolean> {
    const decrypt = await bcrypt.compare(this.password, this.hashPassword);
    return decrypt;
  }
}

export { HashPassword, UnHashPassword };
