// TODO: user interface
import {Types} from 'mongoose';

interface User {
  _id: number;
  user_name: string;
  email: string;
  role: 'admin' | 'user';
  password: string;
}

type UserOutput = Omit<User, 'password' | 'role'>;

type UserTest = Partial<User>;

export {User, UserOutput, UserTest};