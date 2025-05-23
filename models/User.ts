import { Schema, model, models } from 'mongoose';
import UserRole from './UserRole';
import commonSchema from './Common';


const UserSchema = new Schema({
  ...commonSchema.obj,
  username: {
    type: String,
    unique: [true, 'Username already exists!'],
    required: [true, 'Username is required!'],
    match: [/^(?=.{4,35}$)(?![_.])(?!.*[_.]{2})[a-zA-Z0-9._]+(?<![_.])$/, "Username invalid, it should contain 8-35 alphanumeric letters and be unique!"]
  },
  password: {
    type: String,
    required: [true, 'Password is required!'],
  },
  role: {
    type: Schema.Types.ObjectId,
    required: [true, 'Role is required!'],
    ref: UserRole
  },
  email: {
    type: String,
    unique: [true, 'Email already exists!'],
    required: [true, 'Email is required!'],
  },
  image: {
    type: String,
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'suspended'],
    default: 'active'
  },
  passwordResetToken: String,
  passwordResetExpires: Date,
  passwordChangedAt: Date,
}, {
  timestamps: true,
});

const User = models.User || model('User', UserSchema);

export default User;
