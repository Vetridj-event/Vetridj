import mongoose, { Schema, Document } from 'mongoose';
import { User as UserType } from '@/types';

export interface IUser extends Omit<UserType, 'id'>, Document { }

const UserSchema = new Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String },
    role: { type: String, enum: ['ADMIN', 'CREW', 'CUSTOMER'], default: 'CUSTOMER' },
    phone: { type: String },
    whatsapp: { type: String },
    joinedDate: { type: String, default: () => new Date().toISOString() },
    avatar: { type: String },
}, {
    timestamps: true,
    toJSON: {
        transform: (doc, ret: any) => {
            ret.id = ret._id.toString();
            delete ret._id;
            delete ret.__v;
            return ret;
        }
    }
});

export default mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
