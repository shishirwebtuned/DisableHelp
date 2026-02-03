import mongoose from "mongoose";
import type { IWorkerProfile } from "../types/type.js";
export declare const dailyAvailabilitySchema: mongoose.Schema<any, mongoose.Model<any, any, any, any, any, any, any>, {}, {}, {}, {}, {
    _id: false;
}, {
    available: boolean;
    times: mongoose.Types.DocumentArray<{
        startTime: string;
        endTime: string;
    }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, unknown, {
        startTime: string;
        endTime: string;
    }> & {
        startTime: string;
        endTime: string;
    }>;
}, mongoose.Document<unknown, {}, {
    available: boolean;
    times: mongoose.Types.DocumentArray<{
        startTime: string;
        endTime: string;
    }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, unknown, {
        startTime: string;
        endTime: string;
    }> & {
        startTime: string;
        endTime: string;
    }>;
}, {
    id: string;
}, mongoose.ResolveSchemaOptions<{
    _id: false;
}>> & Omit<{
    available: boolean;
    times: mongoose.Types.DocumentArray<{
        startTime: string;
        endTime: string;
    }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, unknown, {
        startTime: string;
        endTime: string;
    }> & {
        startTime: string;
        endTime: string;
    }>;
} & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}, "id"> & {
    id: string;
}, {
    [path: string]: mongoose.SchemaDefinitionProperty<undefined, any, any>;
} | {
    [x: string]: mongoose.SchemaDefinitionProperty<any, any, mongoose.Document<unknown, {}, {
        available: boolean;
        times: mongoose.Types.DocumentArray<{
            startTime: string;
            endTime: string;
        }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, unknown, {
            startTime: string;
            endTime: string;
        }> & {
            startTime: string;
            endTime: string;
        }>;
    }, {
        id: string;
    }, mongoose.ResolveSchemaOptions<{
        _id: false;
    }>> & Omit<{
        available: boolean;
        times: mongoose.Types.DocumentArray<{
            startTime: string;
            endTime: string;
        }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, unknown, {
            startTime: string;
            endTime: string;
        }> & {
            startTime: string;
            endTime: string;
        }>;
    } & {
        _id: mongoose.Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
}, {
    available: boolean;
    times: mongoose.Types.DocumentArray<{
        startTime: string;
        endTime: string;
    }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, unknown, {
        startTime: string;
        endTime: string;
    }> & {
        startTime: string;
        endTime: string;
    }>;
} & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}>;
export declare const WorkerProfile: mongoose.Model<IWorkerProfile, {}, {}, {}, mongoose.Document<unknown, {}, IWorkerProfile, {}, mongoose.DefaultSchemaOptions> & IWorkerProfile & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
} & {
    id: string;
}, any, IWorkerProfile>;
//# sourceMappingURL=workerProfile.model.d.ts.map