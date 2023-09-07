import {Document, Types} from 'mongoose';
import {Point} from 'geojson';

interface Cat extends Document {
  _id: number;
  cat_name: string;
  weight: number;
  filename: string;
  birthdate: Date;
  location: Point;
  owner: Types.ObjectId;
}

export {Cat};