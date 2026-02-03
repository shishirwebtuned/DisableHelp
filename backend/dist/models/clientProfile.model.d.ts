import mongoose from "mongoose";
export interface IClientProfile {
    user: mongoose.Types.ObjectId;
    participants: mongoose.Types.ObjectId[];
    carePreferences?: string[];
    receiveAgreementsEmails: boolean;
    receiveEventDeliveriesEmails: boolean;
    receivePlannedSessionReminderEmails: boolean;
    isNdisManaged: boolean;
}
export declare const ClientProfile: mongoose.Model<IClientProfile, {}, {}, {}, mongoose.Document<unknown, {}, IClientProfile, {}, mongoose.DefaultSchemaOptions> & IClientProfile & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
} & {
    id: string;
}, any, IClientProfile>;
//# sourceMappingURL=clientProfile.model.d.ts.map