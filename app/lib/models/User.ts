import mongoose, { Document, Model, model, models, Schema } from "mongoose";

export interface IUser extends Document {
    _id: mongoose.Types.ObjectId;
    username: string;
    email: string;
    password?: string;
    role: "USER" | "ADMIN";
    balance: number;
    subscriptionStatus: "active" | "inactive" | "expired";
    subscriptionPlan: "basic" | "standard" | "premium" | "none";
    subscriptionStartDate?: Date;
    subscriptionEndDate?: Date;
    autoRenew: boolean;
    usageCountThisMonth: number;
    freePredictionCount: number;
    aiCallAllowance: number;
}

const UserSchema: Schema<IUser> = new Schema(
    {
        username: {
            type: String,
            required: false,
            unique: false,
            default: function () {
                return this.email ? this.email.split("@")[0] : "user_" + Math.random().toString(36).slice(2, 11);
            },
        },
        email: { type: String, required: true, unique: true },
        password: { type: String, required: false },
        role: { type: String, enum: ["USER", "ADMIN"], default: "USER" },
        balance: { type: Number, default: 0 },
        subscriptionStatus: { type: String, enum: ["active", "inactive", "expired"], default: "inactive" },
        subscriptionPlan: { type: String, enum: ["basic", "standard", "premium", "none"], default: "none" },
        subscriptionStartDate: { type: Date },
        subscriptionEndDate: { type: Date },
        autoRenew: { type: Boolean, default: true },
        usageCountThisMonth: { type: Number, default: 0 },
        freePredictionCount: { type: Number, default: 0 },
        aiCallAllowance: { type: Number, default: 3 },
    },
    { timestamps: true }
);

// Method to decrement AI calls
UserSchema.methods.decrementAICalls = async function () {
    if (this.aiCallAllowance > 0) {
        this.aiCallAllowance -= 1;
        await this.save();
        console.log(`🔽 AI Calls decremented for ${this.email}. Remaining: ${this.aiCallAllowance}`);
    }
};

const User: Model<IUser> = models.User || model<IUser>("User", UserSchema);

export default User;
