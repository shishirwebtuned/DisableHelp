import mongoose from "mongoose";
declare const agreementSchema: mongoose.Schema<any, mongoose.Model<any, any, any, any, any, any, any>, {}, {}, {}, {}, {
    timestamps: true;
}, {
    startDate: NativeDate;
    status: "pending" | "active" | "terminated";
    client: mongoose.Types.ObjectId;
    worker: mongoose.Types.ObjectId;
    hourlyRate: number;
    job: mongoose.Types.ObjectId;
    application: mongoose.Types.ObjectId;
    termsAcceptedByWorker: boolean;
    termsAcceptedAt?: NativeDate | null;
    terminatedBy?: mongoose.Types.ObjectId | null;
    terminationReason?: string | null;
    terminatedAt?: NativeDate | null;
} & mongoose.DefaultTimestampProps, mongoose.Document<unknown, {}, {
    startDate: NativeDate;
    status: "pending" | "active" | "terminated";
    client: mongoose.Types.ObjectId;
    worker: mongoose.Types.ObjectId;
    hourlyRate: number;
    job: mongoose.Types.ObjectId;
    application: mongoose.Types.ObjectId;
    termsAcceptedByWorker: boolean;
    termsAcceptedAt?: NativeDate | null;
    terminatedBy?: mongoose.Types.ObjectId | null;
    terminationReason?: string | null;
    terminatedAt?: NativeDate | null;
} & mongoose.DefaultTimestampProps, {
    id: string;
}, mongoose.ResolveSchemaOptions<{
    timestamps: true;
}>> & Omit<{
    startDate: NativeDate;
    status: "pending" | "active" | "terminated";
    client: mongoose.Types.ObjectId;
    worker: mongoose.Types.ObjectId;
    hourlyRate: number;
    job: mongoose.Types.ObjectId;
    application: mongoose.Types.ObjectId;
    termsAcceptedByWorker: boolean;
    termsAcceptedAt?: NativeDate | null;
    terminatedBy?: mongoose.Types.ObjectId | null;
    terminationReason?: string | null;
    terminatedAt?: NativeDate | null;
} & mongoose.DefaultTimestampProps & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}, "id"> & {
    id: string;
}, {
    [path: string]: mongoose.SchemaDefinitionProperty<undefined, any, any>;
} | {
    [x: string]: mongoose.SchemaDefinitionProperty<any, any, mongoose.Document<unknown, {}, {
        startDate: NativeDate;
        status: "pending" | "active" | "terminated";
        client: mongoose.Types.ObjectId;
        worker: mongoose.Types.ObjectId;
        hourlyRate: number;
        job: mongoose.Types.ObjectId;
        application: mongoose.Types.ObjectId;
        termsAcceptedByWorker: boolean;
        termsAcceptedAt?: NativeDate | null;
        terminatedBy?: mongoose.Types.ObjectId | null;
        terminationReason?: string | null;
        terminatedAt?: NativeDate | null;
    } & mongoose.DefaultTimestampProps, {
        id: string;
    }, mongoose.ResolveSchemaOptions<{
        timestamps: true;
    }>> & Omit<{
        startDate: NativeDate;
        status: "pending" | "active" | "terminated";
        client: mongoose.Types.ObjectId;
        worker: mongoose.Types.ObjectId;
        hourlyRate: number;
        job: mongoose.Types.ObjectId;
        application: mongoose.Types.ObjectId;
        termsAcceptedByWorker: boolean;
        termsAcceptedAt?: NativeDate | null;
        terminatedBy?: mongoose.Types.ObjectId | null;
        terminationReason?: string | null;
        terminatedAt?: NativeDate | null;
    } & mongoose.DefaultTimestampProps & {
        _id: mongoose.Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
}, {
    startDate: NativeDate;
    status: "pending" | "active" | "terminated";
    client: mongoose.Types.ObjectId;
    worker: mongoose.Types.ObjectId;
    hourlyRate: number;
    job: mongoose.Types.ObjectId;
    application: mongoose.Types.ObjectId;
    termsAcceptedByWorker: boolean;
    termsAcceptedAt?: NativeDate | null;
    terminatedBy?: mongoose.Types.ObjectId | null;
    terminationReason?: string | null;
    terminatedAt?: NativeDate | null;
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}>;
export declare const Agreement: mongoose.Model<{
    startDate: NativeDate;
    status: "pending" | "active" | "terminated";
    client: mongoose.Types.ObjectId;
    worker: mongoose.Types.ObjectId;
    hourlyRate: number;
    job: mongoose.Types.ObjectId;
    application: mongoose.Types.ObjectId;
    termsAcceptedByWorker: boolean;
    termsAcceptedAt?: NativeDate | null;
    terminatedBy?: mongoose.Types.ObjectId | null;
    terminationReason?: string | null;
    terminatedAt?: NativeDate | null;
} & mongoose.DefaultTimestampProps, {}, {}, {
    id: string;
}, mongoose.Document<unknown, {}, {
    startDate: NativeDate;
    status: "pending" | "active" | "terminated";
    client: mongoose.Types.ObjectId;
    worker: mongoose.Types.ObjectId;
    hourlyRate: number;
    job: mongoose.Types.ObjectId;
    application: mongoose.Types.ObjectId;
    termsAcceptedByWorker: boolean;
    termsAcceptedAt?: NativeDate | null;
    terminatedBy?: mongoose.Types.ObjectId | null;
    terminationReason?: string | null;
    terminatedAt?: NativeDate | null;
} & mongoose.DefaultTimestampProps, {
    id: string;
}, {
    timestamps: true;
}> & Omit<{
    startDate: NativeDate;
    status: "pending" | "active" | "terminated";
    client: mongoose.Types.ObjectId;
    worker: mongoose.Types.ObjectId;
    hourlyRate: number;
    job: mongoose.Types.ObjectId;
    application: mongoose.Types.ObjectId;
    termsAcceptedByWorker: boolean;
    termsAcceptedAt?: NativeDate | null;
    terminatedBy?: mongoose.Types.ObjectId | null;
    terminationReason?: string | null;
    terminatedAt?: NativeDate | null;
} & mongoose.DefaultTimestampProps & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}, "id"> & {
    id: string;
}, mongoose.Schema<any, mongoose.Model<any, any, any, any, any, any, any>, {}, {}, {}, {}, {
    timestamps: true;
}, {
    startDate: NativeDate;
    status: "pending" | "active" | "terminated";
    client: mongoose.Types.ObjectId;
    worker: mongoose.Types.ObjectId;
    hourlyRate: number;
    job: mongoose.Types.ObjectId;
    application: mongoose.Types.ObjectId;
    termsAcceptedByWorker: boolean;
    termsAcceptedAt?: NativeDate | null;
    terminatedBy?: mongoose.Types.ObjectId | null;
    terminationReason?: string | null;
    terminatedAt?: NativeDate | null;
} & mongoose.DefaultTimestampProps, mongoose.Document<unknown, {}, {
    startDate: NativeDate;
    status: "pending" | "active" | "terminated";
    client: mongoose.Types.ObjectId;
    worker: mongoose.Types.ObjectId;
    hourlyRate: number;
    job: mongoose.Types.ObjectId;
    application: mongoose.Types.ObjectId;
    termsAcceptedByWorker: boolean;
    termsAcceptedAt?: NativeDate | null;
    terminatedBy?: mongoose.Types.ObjectId | null;
    terminationReason?: string | null;
    terminatedAt?: NativeDate | null;
} & mongoose.DefaultTimestampProps, {
    id: string;
}, mongoose.ResolveSchemaOptions<{
    timestamps: true;
}>> & Omit<{
    startDate: NativeDate;
    status: "pending" | "active" | "terminated";
    client: mongoose.Types.ObjectId;
    worker: mongoose.Types.ObjectId;
    hourlyRate: number;
    job: mongoose.Types.ObjectId;
    application: mongoose.Types.ObjectId;
    termsAcceptedByWorker: boolean;
    termsAcceptedAt?: NativeDate | null;
    terminatedBy?: mongoose.Types.ObjectId | null;
    terminationReason?: string | null;
    terminatedAt?: NativeDate | null;
} & mongoose.DefaultTimestampProps & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}, "id"> & {
    id: string;
}, {
    [path: string]: mongoose.SchemaDefinitionProperty<undefined, any, any>;
} | {
    [x: string]: mongoose.SchemaDefinitionProperty<any, any, mongoose.Document<unknown, {}, {
        startDate: NativeDate;
        status: "pending" | "active" | "terminated";
        client: mongoose.Types.ObjectId;
        worker: mongoose.Types.ObjectId;
        hourlyRate: number;
        job: mongoose.Types.ObjectId;
        application: mongoose.Types.ObjectId;
        termsAcceptedByWorker: boolean;
        termsAcceptedAt?: NativeDate | null;
        terminatedBy?: mongoose.Types.ObjectId | null;
        terminationReason?: string | null;
        terminatedAt?: NativeDate | null;
    } & mongoose.DefaultTimestampProps, {
        id: string;
    }, mongoose.ResolveSchemaOptions<{
        timestamps: true;
    }>> & Omit<{
        startDate: NativeDate;
        status: "pending" | "active" | "terminated";
        client: mongoose.Types.ObjectId;
        worker: mongoose.Types.ObjectId;
        hourlyRate: number;
        job: mongoose.Types.ObjectId;
        application: mongoose.Types.ObjectId;
        termsAcceptedByWorker: boolean;
        termsAcceptedAt?: NativeDate | null;
        terminatedBy?: mongoose.Types.ObjectId | null;
        terminationReason?: string | null;
        terminatedAt?: NativeDate | null;
    } & mongoose.DefaultTimestampProps & {
        _id: mongoose.Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
}, {
    startDate: NativeDate;
    status: "pending" | "active" | "terminated";
    client: mongoose.Types.ObjectId;
    worker: mongoose.Types.ObjectId;
    hourlyRate: number;
    job: mongoose.Types.ObjectId;
    application: mongoose.Types.ObjectId;
    termsAcceptedByWorker: boolean;
    termsAcceptedAt?: NativeDate | null;
    terminatedBy?: mongoose.Types.ObjectId | null;
    terminationReason?: string | null;
    terminatedAt?: NativeDate | null;
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}>, {
    startDate: NativeDate;
    status: "pending" | "active" | "terminated";
    client: mongoose.Types.ObjectId;
    worker: mongoose.Types.ObjectId;
    hourlyRate: number;
    job: mongoose.Types.ObjectId;
    application: mongoose.Types.ObjectId;
    termsAcceptedByWorker: boolean;
    termsAcceptedAt?: NativeDate | null;
    terminatedBy?: mongoose.Types.ObjectId | null;
    terminationReason?: string | null;
    terminatedAt?: NativeDate | null;
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}>;
export type AgreementDocument = mongoose.InferSchemaType<typeof agreementSchema>;
export {};
//# sourceMappingURL=agreement.model.d.ts.map