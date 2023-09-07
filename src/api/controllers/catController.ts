import {NextFunction, Request, Response} from 'express';
import {validationResult} from 'express-validator';
import CustomError from '../../classes/CustomError';
import CatModel from '../models/catModel';
import rectangleBounds from "../../utils/rectangleBounds";
import {Cat} from "../../interfaces/Cat";
import {User} from "../../interfaces/User";
import DBMessageResponse from "../../interfaces/DBMessageResponse";
import {Types} from "mongoose";

const catGetByUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const message = errors
        .array()
        .map((error) => `${error.msg}: ${error.param}`)
        .join(', ');
      throw new CustomError(message, 400);
    }
    const cats = await CatModel.find({owner: (req.user as User)._id}).populate('owner');
    if (!cats) {
      next(new CustomError('Cats not found', 404));
      return;
    }
    res.json(cats);
  } catch (error) {
    next(new CustomError((error as Error).message, 500));
  }
}

const catPutAdmin = async (
    req: Request<{id: string}, {}, Cat>,
    res: Response,
    next: NextFunction) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        const message = errors
          .array()
          .map((error) => `${error.msg}: ${error.param}`)
          .join(', ');
        throw new CustomError(message, 400);
      }
      let cat;
      if((req.user as User).role === 'admin') {
        cat = await CatModel
          .findByIdAndUpdate(req.params.id, req.body, {new: true});
      } else {
        next(new CustomError('You are not admin', 404));
        return;
      }
      if (!cat) {
        next(new CustomError('Cat not found', 404));
        return;
      }
      const output: DBMessageResponse = {
        message: 'Cat updated',
        data: cat,
      };
      res.json(output);
    } catch (error) {
      next(new CustomError((error as Error).message, 500));
    }
  };

const catGetByBoundingBox = async (
  req: Request<{}, {}, {}, {topRight: string; bottomLeft: string}>,
  res: Response,
  next: NextFunction) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const message = errors
        .array()
        .map((error) => `${error.msg}: ${error.param}`)
        .join(', ');
      throw new CustomError(message, 400);
    }
    const {topRight, bottomLeft} = req.query;
    const [topRightLat, topRightLng] = topRight.split(',');
    const [bottomLeftLat, bottomLeftLng] = bottomLeft.split(',');
    const bounds = rectangleBounds(
      {lat: Number(topRightLat), lng: Number(topRightLng)},
      {lat: Number(bottomLeftLat), lng: Number(bottomLeftLng)}
    );
    console.log(bounds.coordinates);
    const cats = await CatModel.find({
      location: {
        $geoWithin: {
          $geometry: bounds,
        },
      },
    });
    if (!cats || cats.length === 0) {
      next(new CustomError('Cats not found', 404));
      return;
    }
    res.json(cats);
  } catch (error) {
    next(new CustomError((error as Error).message, 500));
  }
};



const catPut = async (
  req: Request<{id: string}, {}, Cat>,
  res: Response,
  next: NextFunction) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const message = errors
        .array()
        .map((error) => `${error.msg}: ${error.param}`)
        .join(', ');
      throw new CustomError(message, 400);
    }
    const cat = await CatModel
      .findByIdAndUpdate(req.params.id, req.body, {new: true})
      .populate('owner');
    if (!cat) {
      next(new CustomError('Cat not found', 404));
      return;
    }
    const output: DBMessageResponse = {
      message: 'Cat updated',
      data: cat,
    }
    res.json(output);
  } catch (error) {
    next(new CustomError((error as Error).message, 500));
  }
};

const catGet = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const message = errors
        .array()
        .map((error) => `${error.msg}: ${error.param}`)
        .join(', ');
      throw new CustomError(message, 400);
    }
    const cat = await CatModel
      .findById(req.params.id)
      .populate('owner');
    if (!cat) {
      next(new CustomError('Cat not found', 404));
      return;
    }
    res.json(cat);
  } catch (error) {
    next(new CustomError((error as Error).message, 500));
  }
};

const catListGet = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const message = errors
        .array()
        .map((error) => `${error.msg}: ${error.param}`)
        .join(', ');
      throw new CustomError(message, 400);
    }
    const cats = await CatModel.find().populate('owner');
    if (!cats) {
      next(new CustomError('Cats not found', 404));
      return;
    }
    res.json(cats);
  } catch (error) {
    next(new CustomError((error as Error).message, 500));
  }
};

const catPost = async (
  req: Request<{}, {}, Cat>,
  res: Response,
  next: NextFunction) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const message = errors
        .array()
        .map((error) => `${error.msg}: ${error.param}`)
        .join(', ');
      throw new CustomError(message, 400);
    }
    if (!req.body.filename && req.file) {
      req.body.filename = req.file.filename;
    }
    if (!req.body.owner) {
      req.body.owner = new Types.ObjectId((req.user as User)._id);
    }
    if (!req.body.location) {
      req.body.location = res.locals.coords;
    }
    const cat = await CatModel.create(req.body);
    console.log(cat);
    const output: DBMessageResponse = {
      message: 'Cat created',
      data: cat,
    };
    res.json(output);
  } catch (error) {
    next(new CustomError((error as Error).message, 500));
  }
};

const catDelete = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        const message = errors
          .array()
          .map((error) => `${error.msg}: ${error.param}`)
          .join(', ');
        throw new CustomError(message, 400);
      }
      const cat = await CatModel
        .findByIdAndDelete(req.params.id)
        .populate('owner');
      if (!cat) {
        next(new CustomError('Cat not found', 404));
        return;
      }
      await CatModel.findByIdAndDelete(req.params.id);
      const output: DBMessageResponse = {
        message: 'Cat deleted',
        data: cat,
      };
      res.json(output);
    } catch (error) {
      next(new CustomError((error as Error).message, 500));
    }
  };

  const catDeleteAdmin = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        const message = errors
          .array()
          .map((error) => `${error.msg}: ${error.param}`)
          .join(', ');
        throw new CustomError(message, 400);
      }
      let cat;
      if((req.user as User).role === 'admin') {
        cat = await CatModel.findByIdAndDelete(req.params.id);
      } else {
        next(new CustomError('You are not admin', 404));
        return;
      }
      if (!cat) {
        next(new CustomError('Cat not found', 404));
        return;
      }
      const output: DBMessageResponse = {
        message: 'Cat deleted',
        data: cat,
      };
      res.json(output);
    } catch (error) {
      next(new CustomError((error as Error).message, 500));
    }
  }

export {catGetByUser, catDeleteAdmin, catDelete, catPut, catGet, catListGet, catPost, catGetByBoundingBox, catPutAdmin};