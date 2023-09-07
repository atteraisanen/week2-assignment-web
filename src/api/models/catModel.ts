import mongoose from 'mongoose';
import {Cat} from '../../interfaces/Cat';

const catSchema = new mongoose.Schema<Cat>({
  cat_name: { type: String, required: true },
  weight: { type: Number, required: true },
  filename: { type: String, required: true, minlength: 3 },
  birthdate: { type: Date, required: true, max: Date.now() },
  location: {
    type: { type: String, enum: ['Point'], required: false},
    coordinates: { type: [Number], required: false },
  },
  owner: {type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true},
});

export default mongoose.model<Cat>('Cat', catSchema);