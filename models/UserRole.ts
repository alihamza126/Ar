import { Schema, model, models } from 'mongoose';

const UserRoleSchema = new Schema({
  name: {
    type: String,
    unique: [true, 'name already exists!'],
    required: [true, 'name is required!'],
  },
}, {
  timestamps: true,
  collection: 'user_roles' // Specify the collection name here
});

const UserRole = models.UserRole || model('UserRole', UserRoleSchema);

export default UserRole;
