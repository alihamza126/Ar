import { Schema } from 'mongoose';

const commonSchema = new Schema({

    createdDate: {
        type: Date,
        default: Date.now,
    },
    createdBy: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        // required: [true, 'User is required!'],
    },
    updatedDate: {
        type: Date,
    },
    updatedBy: {
        type: Schema.Types.ObjectId,
        ref: 'User',
    },
    isDeleted: {
        type: Boolean,
        default: false,
    },
    deletedDate: {
        type: Date,
    },
    // Add other common fields here
}, {
    timestamps: true,
});

export default commonSchema;
