import mongoose, { Schema, Document } from 'mongoose';
import { Booking as BookingType } from '@/types';

export interface IBooking extends Omit<BookingType, 'id'>, Document { }

const BookingSchema = new Schema({
    customerName: { type: String, required: true },
    customerPhone: { type: String },
    customerEmail: { type: String },
    eventType: { type: String, required: true },
    date: { type: String, required: true },
    packageId: { type: String },
    status: {
        type: String,
        enum: ['PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED'],
        default: 'PENDING'
    },
    amount: { type: Number, required: true },
    advanceAmount: { type: Number, default: 0 },
    receivedAmount: { type: Number, default: 0 },
    balanceAmount: { type: Number, default: 0 },
    location: { type: String },
    customerId: { type: String },
    crewAssigned: [{ type: String }],
    notes: { type: String },
    checkInTime: { type: Map, of: String },
    djPackage: { type: String },
    additionalNotes: { type: String },
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

BookingSchema.index({ customerName: 'text', date: 1 });

export default mongoose.models.Booking || mongoose.model<IBooking>('Booking', BookingSchema);
