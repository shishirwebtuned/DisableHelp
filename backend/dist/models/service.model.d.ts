import mongoose from "mongoose";
declare const serviceSchema: mongoose.Schema<any, mongoose.Model<any, any, any, any, any, any, any>, {}, {}, {}, {}, {
    timestamps: true;
}, {
    name: string;
    status: boolean;
    code: string;
    categories: string[];
} & mongoose.DefaultTimestampProps, mongoose.Document<unknown, {}, {
    name: string;
    status: boolean;
    code: string;
    categories: string[];
} & mongoose.DefaultTimestampProps, {
    id: string;
}, mongoose.ResolveSchemaOptions<{
    timestamps: true;
}>> & Omit<{
    name: string;
    status: boolean;
    code: string;
    categories: string[];
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
        name: string;
        status: boolean;
        code: string;
        categories: string[];
    } & mongoose.DefaultTimestampProps, {
        id: string;
    }, mongoose.ResolveSchemaOptions<{
        timestamps: true;
    }>> & Omit<{
        name: string;
        status: boolean;
        code: string;
        categories: string[];
    } & mongoose.DefaultTimestampProps & {
        _id: mongoose.Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
}, {
    name: string;
    status: boolean;
    code: string;
    categories: string[];
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}>;
export declare const Service: mongoose.Model<{
    name: string;
    status: boolean;
    code: string;
    categories: string[];
} & mongoose.DefaultTimestampProps, {}, {}, {
    id: string;
}, mongoose.Document<unknown, {}, {
    name: string;
    status: boolean;
    code: string;
    categories: string[];
} & mongoose.DefaultTimestampProps, {
    id: string;
}, {
    timestamps: true;
}> & Omit<{
    name: string;
    status: boolean;
    code: string;
    categories: string[];
} & mongoose.DefaultTimestampProps & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}, "id"> & {
    id: string;
}, mongoose.Schema<any, mongoose.Model<any, any, any, any, any, any, any>, {}, {}, {}, {}, {
    timestamps: true;
}, {
    name: string;
    status: boolean;
    code: string;
    categories: string[];
} & mongoose.DefaultTimestampProps, mongoose.Document<unknown, {}, {
    name: string;
    status: boolean;
    code: string;
    categories: string[];
} & mongoose.DefaultTimestampProps, {
    id: string;
}, mongoose.ResolveSchemaOptions<{
    timestamps: true;
}>> & Omit<{
    name: string;
    status: boolean;
    code: string;
    categories: string[];
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
        name: string;
        status: boolean;
        code: string;
        categories: string[];
    } & mongoose.DefaultTimestampProps, {
        id: string;
    }, mongoose.ResolveSchemaOptions<{
        timestamps: true;
    }>> & Omit<{
        name: string;
        status: boolean;
        code: string;
        categories: string[];
    } & mongoose.DefaultTimestampProps & {
        _id: mongoose.Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
}, {
    name: string;
    status: boolean;
    code: string;
    categories: string[];
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}>, {
    name: string;
    status: boolean;
    code: string;
    categories: string[];
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}>;
export type ServiceDocument = mongoose.InferSchemaType<typeof serviceSchema>;
export {};
//# sourceMappingURL=service.model.d.ts.map