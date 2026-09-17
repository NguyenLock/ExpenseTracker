export type UserType = {
  id: string;
  email: string;
  name: string;
  createdAt: string;
  updatedAt: string;
};

export type AuthResponseType = {
  user: UserType;
};
