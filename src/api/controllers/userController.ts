import {validationResult} from 'express-validator';
import {NextFunction, Request, Response} from 'express';
import CustomError from '../../classes/CustomError';
import UserModel from '../models/userModel';
import {User, UserOutput} from '../../interfaces/User';
import DBMessageResponse from "../../interfaces/DBMessageResponse";
import userModel from "../models/userModel";
import bcrypt from "bcryptjs";

const checkToken = async (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      next(new CustomError('token not valid', 403));
    } else {
      const userOutput: UserOutput = {
        _id: (req.user as User)._id,
        user_name: (req.user as User).user_name,
        email: (req.user as User).email,
      }
      res.json(userOutput);
    }
  };

const userGet = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const message = errors
        .array()
        .map((error) => error.msg)
        .join(', ');
      throw new CustomError(message, 400);
    }
    const user = await UserModel.findById(req.params.id).select('-role');
    if (!user) {
      next(new CustomError('User not found', 404));
      return;
    }
    res.json(user);
  } catch (error) {
    next(new CustomError((error as Error).message, 500));
  }
};

const userListGet = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const users = await UserModel.find().select('-__v -role');
    if (!users) {
      next(new CustomError('Users not found', 404));
      return;
    }
    res.json(users);
  } catch (error) {
    next(new CustomError((error as Error).message, 500));
  }
};

const userPost = async (
  req: Request<{}, {}, User>,
  res: Response,
  next: NextFunction
) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const message = errors
        .array()
        .map((error) => `${error.msg}: ${error.param}`)
        .join(', ');
      throw new CustomError(message, 400);
    }
    req.body.password = await bcrypt.hash(req.body.password, 12);
    if (!req.body.role) {
      req.body.role = 'user';
    }
    const user = await UserModel.create(req.body);
    const outUser: UserOutput = {
      _id: user._id,
      user_name: user.user_name,
      email: user.email,
    }
    const output: DBMessageResponse = {
      message: 'User created',
      data: outUser,
    };
    res.json(output);
  } catch (error) {
    next(new CustomError((error as Error).message, 500));
  }
};

const userPutCurrent = async (
  req: Request<{id: string}, {}, User>,
  res: Response,
  next: NextFunction
) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const message = errors
        .array()
        .map((error) => `${error.msg}: ${error.param}`)
        .join(', ');
      throw new CustomError(message, 400);
    }
    const id = (req.user as User)._id;
    const user = await userModel
      .findByIdAndUpdate(id, req.body, {new: true})
      .select('-password -role');
    if (!user) {
      next(new CustomError('User not found', 404));
      return;
    }
    const output: DBMessageResponse = {
      message: 'User updated',
      data: user,
    };
    res.json(output);
  } catch (error) {
    next(new CustomError((error as Error).message, 500));
  }
};

const userDeleteCurrent = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const message = errors
        .array()
        .map((error) => `${error.msg}: ${error.param}`)
        .join(', ');
      throw new CustomError(message, 400);
    }
    const user = await UserModel
      .findByIdAndDelete((req.user as User)._id);
    if (!user) {
      next(new CustomError('User not found', 404));
      return;
    }
    const outUser: UserOutput = {
      _id: user._id,
      user_name: user.user_name,
      email: user.email,
    }
    const output: DBMessageResponse = {
      message: 'User deleted',
      data: outUser,
    };
    res.json(output);
  } catch (error) {
    next(new CustomError((error as Error).message, 500));
  }
};




export {userGet, userListGet, userPost, userPutCurrent, userDeleteCurrent, checkToken};