import mongoose, { Document, Model, model, models, Schema } from 'mongoose';

interface IUser extends Document {
    _id: mongoose.Types.ObjectId;
    username: string;
    email: string;
    password: string;
    role: 'USER' | 'ADMIN';
    voiceNotes: mongoose.Types.ObjectId[];
    balance?: number;
    subscriptionStatus?: string;
    subscriptionPlan?: string;
    usageCountThisMonth?: number;
}

const UserSchema: Schema<IUser> = new Schema({
    username: { type: String, required: false },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: false },
    role: { type: String, enum: ['USER', 'ADMIN'], default: 'USER' },
    voiceNotes: [{ type: Schema.Types.ObjectId, ref: 'VoiceNote' }],
    balance: { type: Number, default: 0 },
    subscriptionStatus: { type: String, default: 'inactive' },
    subscriptionPlan: { type: String, default: 'none' },
    usageCountThisMonth: { type: Number, default: 0 },
}, { timestamps: true });

const User: Model<IUser> = models.User || model<IUser>('User', UserSchema);

export type { IUser };
export default User;
