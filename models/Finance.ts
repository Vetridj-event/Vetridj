import mongoose, { Schema, Document } from 'mongoose';
import { FinanceRecord } from '@/types';

export interface IFinance extends Omit<FinanceRecord, 'id'>, Document { }

const FinanceSchema = new Schema({
    type: { type: String, enum: ['INCOME', 'EXPENSE'], required: true },
    amount: { type: Number, required: true },
    description: { type: String, required: true },
    category: { type: String },
    date: { type: String, required: true },
    relatedBookingId: { type: String },
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

FinanceSchema.index({ date: -1 });

export default mongoose.models.Finance || mongoose.model<IFinance>('Finance', FinanceSchema);
