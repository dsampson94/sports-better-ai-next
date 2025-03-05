import mongoose, { Schema, Document, Model, model, models } from 'mongoose';

export interface ITransaction extends Document {
    user: mongoose.Types.ObjectId;
    amount: number;
    type: 'credit' | 'debit';
    description: string;
    createdAt: Date;
}

const TransactionSchema: Schema<ITransaction> = new Schema({
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    amount: { type: Number, required: true },
    type: { type: String, enum: ['credit', 'debit'], required: true },
    description: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
});

const Transaction: Model<ITransaction> = models.Transaction || model<ITransaction>('Transaction', TransactionSchema);
export default Transaction;
