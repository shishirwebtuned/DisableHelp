import mongoose, { Schema } from "mongoose";
const clientProfileSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
        unique: true,
    },
    participants: [
        {
            type: Schema.Types.ObjectId,
            ref: "User",
        },
    ],
    carePreferences: [String],
    receiveAgreementsEmails: {
        type: Boolean,
        default: true,
    },
    receiveEventDeliveriesEmails: {
        type: Boolean,
        default: true,
    },
    receivePlannedSessionReminderEmails: {
        type: Boolean,
        default: true,
    },
    isNdisManaged: {
        type: Boolean,
        default: false,
    },
}, { timestamps: true });
export const ClientProfile = mongoose.model("ClientProfile", clientProfileSchema);
//# sourceMappingURL=clientProfile.model.js.map