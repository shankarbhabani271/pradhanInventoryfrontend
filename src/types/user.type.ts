
export enum USER_ROLE_IN_ORG {
  ADMIN = "ADMIN",
  OWNER = "OWNER",
  STAFF = "STAFF",
  MANAGER = "MANAGER",
  FINANCE = "FINANCE",
  STORE_SUPERVISOR = "STORE_SUPERVISOR",
  PRODUCT_SELLER = "PRODUCT_SELLER",
}
export enum USER_ROLE {
  SUPER_ADMIN = "SUPER_ADMIN",
  "USER" = "USER",
}

export type ISODateString = string & { __brand: "ISODateString" };

export enum USER_STATUS {
  ACTIVE = "ACTIVE",
  SUSPENDED = "SUSPENDED",
}

export interface IUser {
  _id: string;
  name: string;
  phone: string;
  email: string;
  role: USER_ROLE;
  userStatus: USER_STATUS;
  lastLogin: ISODateString;
  createdAt: ISODateString;
}

export interface ILoginResponse {
  accessToken: string;
}


export interface GenerateOTPData {
  email: string;
}

export interface SignUpData {
  name: string;
  password: string;
  email: string;
  phone: number;
  otp: number;
}

export interface ForgotPasswordData {
  password: string;
  email: string;
  otp: number;
}