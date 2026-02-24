import mongoose from "mongoose";
declare const jobSchema: mongoose.Schema<any, mongoose.Model<any, any, any, any, any, any, any>, {}, {}, {}, {}, {
    timestamps: true;
}, {
    status: "pending" | "rejected" | "approved";
    client: mongoose.Types.ObjectId;
    frequency: "daily" | "weekly" | "fortnightly" | "monthly";
    title: string;
    supportDetails: mongoose.Types.DocumentArray<{
        name: string;
        details: string[];
    }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, unknown, {
        name: string;
        details: string[];
    }> & {
        name: string;
        details: string[];
    }>;
    jobSessionByClient: boolean;
    hourlyRate: number;
    jobSessions: mongoose.Types.DocumentArray<{
        period: mongoose.Types.DocumentArray<{
            startTime?: string | null;
            endTime?: string | null;
        }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, unknown, {
            startTime?: string | null;
            endTime?: string | null;
        }> & {
            startTime?: string | null;
            endTime?: string | null;
        }>;
        day?: string | null;
    }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, unknown, {
        period: mongoose.Types.DocumentArray<{
            startTime?: string | null;
            endTime?: string | null;
        }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, unknown, {
            startTime?: string | null;
            endTime?: string | null;
        }> & {
            startTime?: string | null;
            endTime?: string | null;
        }>;
        day?: string | null;
    }> & {
        period: mongoose.Types.DocumentArray<{
            startTime?: string | null;
            endTime?: string | null;
        }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, unknown, {
            startTime?: string | null;
            endTime?: string | null;
        }> & {
            startTime?: string | null;
            endTime?: string | null;
        }>;
        day?: string | null;
    }>;
    startDate?: NativeDate | null;
    location?: {
        postalCode: string;
        state: string;
        line1: string;
        line2: string;
    } | null;
    duration?: {
        session: number;
        hours: number;
    } | null;
    preference?: {
        others: string[];
        gender?: "male" | "female" | "other" | null;
    } | null;
} & mongoose.DefaultTimestampProps, mongoose.Document<unknown, {}, {
    status: "pending" | "rejected" | "approved";
    client: mongoose.Types.ObjectId;
    frequency: "daily" | "weekly" | "fortnightly" | "monthly";
    title: string;
    supportDetails: mongoose.Types.DocumentArray<{
        name: string;
        details: string[];
    }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, unknown, {
        name: string;
        details: string[];
    }> & {
        name: string;
        details: string[];
    }>;
    jobSessionByClient: boolean;
    hourlyRate: number;
    jobSessions: mongoose.Types.DocumentArray<{
        period: mongoose.Types.DocumentArray<{
            startTime?: string | null;
            endTime?: string | null;
        }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, unknown, {
            startTime?: string | null;
            endTime?: string | null;
        }> & {
            startTime?: string | null;
            endTime?: string | null;
        }>;
        day?: string | null;
    }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, unknown, {
        period: mongoose.Types.DocumentArray<{
            startTime?: string | null;
            endTime?: string | null;
        }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, unknown, {
            startTime?: string | null;
            endTime?: string | null;
        }> & {
            startTime?: string | null;
            endTime?: string | null;
        }>;
        day?: string | null;
    }> & {
        period: mongoose.Types.DocumentArray<{
            startTime?: string | null;
            endTime?: string | null;
        }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, unknown, {
            startTime?: string | null;
            endTime?: string | null;
        }> & {
            startTime?: string | null;
            endTime?: string | null;
        }>;
        day?: string | null;
    }>;
    startDate?: NativeDate | null;
    location?: {
        postalCode: string;
        state: string;
        line1: string;
        line2: string;
    } | null;
    duration?: {
        session: number;
        hours: number;
    } | null;
    preference?: {
        others: string[];
        gender?: "male" | "female" | "other" | null;
    } | null;
} & mongoose.DefaultTimestampProps, {
    id: string;
}, mongoose.ResolveSchemaOptions<{
    timestamps: true;
}>> & Omit<{
    status: "pending" | "rejected" | "approved";
    client: mongoose.Types.ObjectId;
    frequency: "daily" | "weekly" | "fortnightly" | "monthly";
    title: string;
    supportDetails: mongoose.Types.DocumentArray<{
        name: string;
        details: string[];
    }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, unknown, {
        name: string;
        details: string[];
    }> & {
        name: string;
        details: string[];
    }>;
    jobSessionByClient: boolean;
    hourlyRate: number;
    jobSessions: mongoose.Types.DocumentArray<{
        period: mongoose.Types.DocumentArray<{
            startTime?: string | null;
            endTime?: string | null;
        }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, unknown, {
            startTime?: string | null;
            endTime?: string | null;
        }> & {
            startTime?: string | null;
            endTime?: string | null;
        }>;
        day?: string | null;
    }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, unknown, {
        period: mongoose.Types.DocumentArray<{
            startTime?: string | null;
            endTime?: string | null;
        }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, unknown, {
            startTime?: string | null;
            endTime?: string | null;
        }> & {
            startTime?: string | null;
            endTime?: string | null;
        }>;
        day?: string | null;
    }> & {
        period: mongoose.Types.DocumentArray<{
            startTime?: string | null;
            endTime?: string | null;
        }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, unknown, {
            startTime?: string | null;
            endTime?: string | null;
        }> & {
            startTime?: string | null;
            endTime?: string | null;
        }>;
        day?: string | null;
    }>;
    startDate?: NativeDate | null;
    location?: {
        postalCode: string;
        state: string;
        line1: string;
        line2: string;
    } | null;
    duration?: {
        session: number;
        hours: number;
    } | null;
    preference?: {
        others: string[];
        gender?: "male" | "female" | "other" | null;
    } | null;
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
        status: "pending" | "rejected" | "approved";
        client: mongoose.Types.ObjectId;
        frequency: "daily" | "weekly" | "fortnightly" | "monthly";
        title: string;
        supportDetails: mongoose.Types.DocumentArray<{
            name: string;
            details: string[];
        }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, unknown, {
            name: string;
            details: string[];
        }> & {
            name: string;
            details: string[];
        }>;
        jobSessionByClient: boolean;
        hourlyRate: number;
        jobSessions: mongoose.Types.DocumentArray<{
            period: mongoose.Types.DocumentArray<{
                startTime?: string | null;
                endTime?: string | null;
            }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, unknown, {
                startTime?: string | null;
                endTime?: string | null;
            }> & {
                startTime?: string | null;
                endTime?: string | null;
            }>;
            day?: string | null;
        }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, unknown, {
            period: mongoose.Types.DocumentArray<{
                startTime?: string | null;
                endTime?: string | null;
            }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, unknown, {
                startTime?: string | null;
                endTime?: string | null;
            }> & {
                startTime?: string | null;
                endTime?: string | null;
            }>;
            day?: string | null;
        }> & {
            period: mongoose.Types.DocumentArray<{
                startTime?: string | null;
                endTime?: string | null;
            }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, unknown, {
                startTime?: string | null;
                endTime?: string | null;
            }> & {
                startTime?: string | null;
                endTime?: string | null;
            }>;
            day?: string | null;
        }>;
        startDate?: NativeDate | null;
        location?: {
            postalCode: string;
            state: string;
            line1: string;
            line2: string;
        } | null;
        duration?: {
            session: number;
            hours: number;
        } | null;
        preference?: {
            others: string[];
            gender?: "male" | "female" | "other" | null;
        } | null;
    } & mongoose.DefaultTimestampProps, {
        id: string;
    }, mongoose.ResolveSchemaOptions<{
        timestamps: true;
    }>> & Omit<{
        status: "pending" | "rejected" | "approved";
        client: mongoose.Types.ObjectId;
        frequency: "daily" | "weekly" | "fortnightly" | "monthly";
        title: string;
        supportDetails: mongoose.Types.DocumentArray<{
            name: string;
            details: string[];
        }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, unknown, {
            name: string;
            details: string[];
        }> & {
            name: string;
            details: string[];
        }>;
        jobSessionByClient: boolean;
        hourlyRate: number;
        jobSessions: mongoose.Types.DocumentArray<{
            period: mongoose.Types.DocumentArray<{
                startTime?: string | null;
                endTime?: string | null;
            }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, unknown, {
                startTime?: string | null;
                endTime?: string | null;
            }> & {
                startTime?: string | null;
                endTime?: string | null;
            }>;
            day?: string | null;
        }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, unknown, {
            period: mongoose.Types.DocumentArray<{
                startTime?: string | null;
                endTime?: string | null;
            }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, unknown, {
                startTime?: string | null;
                endTime?: string | null;
            }> & {
                startTime?: string | null;
                endTime?: string | null;
            }>;
            day?: string | null;
        }> & {
            period: mongoose.Types.DocumentArray<{
                startTime?: string | null;
                endTime?: string | null;
            }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, unknown, {
                startTime?: string | null;
                endTime?: string | null;
            }> & {
                startTime?: string | null;
                endTime?: string | null;
            }>;
            day?: string | null;
        }>;
        startDate?: NativeDate | null;
        location?: {
            postalCode: string;
            state: string;
            line1: string;
            line2: string;
        } | null;
        duration?: {
            session: number;
            hours: number;
        } | null;
        preference?: {
            others: string[];
            gender?: "male" | "female" | "other" | null;
        } | null;
    } & mongoose.DefaultTimestampProps & {
        _id: mongoose.Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
}, {
    status: "pending" | "rejected" | "approved";
    client: mongoose.Types.ObjectId;
    frequency: "daily" | "weekly" | "fortnightly" | "monthly";
    title: string;
    supportDetails: mongoose.Types.DocumentArray<{
        name: string;
        details: string[];
    }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, unknown, {
        name: string;
        details: string[];
    }> & {
        name: string;
        details: string[];
    }>;
    jobSessionByClient: boolean;
    hourlyRate: number;
    jobSessions: mongoose.Types.DocumentArray<{
        period: mongoose.Types.DocumentArray<{
            startTime?: string | null;
            endTime?: string | null;
        }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, unknown, {
            startTime?: string | null;
            endTime?: string | null;
        }> & {
            startTime?: string | null;
            endTime?: string | null;
        }>;
        day?: string | null;
    } | {
        period: mongoose.Types.DocumentArray<{
            startTime?: string | null;
            endTime?: string | null;
        }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, unknown, {
            startTime?: string | null;
            endTime?: string | null;
        }> & {
            startTime?: string | null;
            endTime?: string | null;
        }>;
        day?: string | null;
        _id: string;
    } | {
        period: mongoose.Types.DocumentArray<{
            startTime?: string | null;
            endTime?: string | null;
        }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, unknown, {
            startTime?: string | null;
            endTime?: string | null;
        }> & {
            startTime?: string | null;
            endTime?: string | null;
        }>;
        day?: string | null;
        _id: string;
    }, mongoose.Types.Subdocument<string | mongoose.mongo.BSON.ObjectId, unknown, {
        period: mongoose.Types.DocumentArray<{
            startTime?: string | null;
            endTime?: string | null;
        }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, unknown, {
            startTime?: string | null;
            endTime?: string | null;
        }> & {
            startTime?: string | null;
            endTime?: string | null;
        }>;
        day?: string | null;
    } | {
        period: mongoose.Types.DocumentArray<{
            startTime?: string | null;
            endTime?: string | null;
        }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, unknown, {
            startTime?: string | null;
            endTime?: string | null;
        }> & {
            startTime?: string | null;
            endTime?: string | null;
        }>;
        day?: string | null;
        _id: string;
    } | {
        period: mongoose.Types.DocumentArray<{
            startTime?: string | null;
            endTime?: string | null;
        }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, unknown, {
            startTime?: string | null;
            endTime?: string | null;
        }> & {
            startTime?: string | null;
            endTime?: string | null;
        }>;
        day?: string | null;
        _id: string;
    }> & ({
        period: mongoose.Types.DocumentArray<{
            startTime?: string | null;
            endTime?: string | null;
        }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, unknown, {
            startTime?: string | null;
            endTime?: string | null;
        }> & {
            startTime?: string | null;
            endTime?: string | null;
        }>;
        day?: string | null;
    } | {
        period: mongoose.Types.DocumentArray<{
            startTime?: string | null;
            endTime?: string | null;
        }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, unknown, {
            startTime?: string | null;
            endTime?: string | null;
        }> & {
            startTime?: string | null;
            endTime?: string | null;
        }>;
        day?: string | null;
        _id: string;
    } | {
        period: mongoose.Types.DocumentArray<{
            startTime?: string | null;
            endTime?: string | null;
        }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, unknown, {
            startTime?: string | null;
            endTime?: string | null;
        }> & {
            startTime?: string | null;
            endTime?: string | null;
        }>;
        day?: string | null;
        _id: string;
    })>;
    startDate?: NativeDate | null;
    location?: {
        postalCode: string;
        state: string;
        line1: string;
        line2: string;
    } | null;
    duration?: {
        session: number;
        hours: number;
    } | null;
    preference?: {
        others: string[];
        gender?: "male" | "female" | "other" | null;
    } | null;
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}>;
export declare const Job: mongoose.Model<{
    status: "pending" | "rejected" | "approved";
    client: mongoose.Types.ObjectId;
    frequency: "daily" | "weekly" | "fortnightly" | "monthly";
    title: string;
    supportDetails: mongoose.Types.DocumentArray<{
        name: string;
        details: string[];
    }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, unknown, {
        name: string;
        details: string[];
    }> & {
        name: string;
        details: string[];
    }>;
    jobSessionByClient: boolean;
    hourlyRate: number;
    jobSessions: mongoose.Types.DocumentArray<{
        period: mongoose.Types.DocumentArray<{
            startTime?: string | null;
            endTime?: string | null;
        }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, unknown, {
            startTime?: string | null;
            endTime?: string | null;
        }> & {
            startTime?: string | null;
            endTime?: string | null;
        }>;
        day?: string | null;
    }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, unknown, {
        period: mongoose.Types.DocumentArray<{
            startTime?: string | null;
            endTime?: string | null;
        }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, unknown, {
            startTime?: string | null;
            endTime?: string | null;
        }> & {
            startTime?: string | null;
            endTime?: string | null;
        }>;
        day?: string | null;
    }> & {
        period: mongoose.Types.DocumentArray<{
            startTime?: string | null;
            endTime?: string | null;
        }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, unknown, {
            startTime?: string | null;
            endTime?: string | null;
        }> & {
            startTime?: string | null;
            endTime?: string | null;
        }>;
        day?: string | null;
    }>;
    startDate?: NativeDate | null;
    location?: {
        postalCode: string;
        state: string;
        line1: string;
        line2: string;
    } | null;
    duration?: {
        session: number;
        hours: number;
    } | null;
    preference?: {
        others: string[];
        gender?: "male" | "female" | "other" | null;
    } | null;
} & mongoose.DefaultTimestampProps, {}, {}, {
    id: string;
}, mongoose.Document<unknown, {}, {
    status: "pending" | "rejected" | "approved";
    client: mongoose.Types.ObjectId;
    frequency: "daily" | "weekly" | "fortnightly" | "monthly";
    title: string;
    supportDetails: mongoose.Types.DocumentArray<{
        name: string;
        details: string[];
    }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, unknown, {
        name: string;
        details: string[];
    }> & {
        name: string;
        details: string[];
    }>;
    jobSessionByClient: boolean;
    hourlyRate: number;
    jobSessions: mongoose.Types.DocumentArray<{
        period: mongoose.Types.DocumentArray<{
            startTime?: string | null;
            endTime?: string | null;
        }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, unknown, {
            startTime?: string | null;
            endTime?: string | null;
        }> & {
            startTime?: string | null;
            endTime?: string | null;
        }>;
        day?: string | null;
    }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, unknown, {
        period: mongoose.Types.DocumentArray<{
            startTime?: string | null;
            endTime?: string | null;
        }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, unknown, {
            startTime?: string | null;
            endTime?: string | null;
        }> & {
            startTime?: string | null;
            endTime?: string | null;
        }>;
        day?: string | null;
    }> & {
        period: mongoose.Types.DocumentArray<{
            startTime?: string | null;
            endTime?: string | null;
        }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, unknown, {
            startTime?: string | null;
            endTime?: string | null;
        }> & {
            startTime?: string | null;
            endTime?: string | null;
        }>;
        day?: string | null;
    }>;
    startDate?: NativeDate | null;
    location?: {
        postalCode: string;
        state: string;
        line1: string;
        line2: string;
    } | null;
    duration?: {
        session: number;
        hours: number;
    } | null;
    preference?: {
        others: string[];
        gender?: "male" | "female" | "other" | null;
    } | null;
} & mongoose.DefaultTimestampProps, {
    id: string;
}, {
    timestamps: true;
}> & Omit<{
    status: "pending" | "rejected" | "approved";
    client: mongoose.Types.ObjectId;
    frequency: "daily" | "weekly" | "fortnightly" | "monthly";
    title: string;
    supportDetails: mongoose.Types.DocumentArray<{
        name: string;
        details: string[];
    }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, unknown, {
        name: string;
        details: string[];
    }> & {
        name: string;
        details: string[];
    }>;
    jobSessionByClient: boolean;
    hourlyRate: number;
    jobSessions: mongoose.Types.DocumentArray<{
        period: mongoose.Types.DocumentArray<{
            startTime?: string | null;
            endTime?: string | null;
        }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, unknown, {
            startTime?: string | null;
            endTime?: string | null;
        }> & {
            startTime?: string | null;
            endTime?: string | null;
        }>;
        day?: string | null;
    }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, unknown, {
        period: mongoose.Types.DocumentArray<{
            startTime?: string | null;
            endTime?: string | null;
        }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, unknown, {
            startTime?: string | null;
            endTime?: string | null;
        }> & {
            startTime?: string | null;
            endTime?: string | null;
        }>;
        day?: string | null;
    }> & {
        period: mongoose.Types.DocumentArray<{
            startTime?: string | null;
            endTime?: string | null;
        }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, unknown, {
            startTime?: string | null;
            endTime?: string | null;
        }> & {
            startTime?: string | null;
            endTime?: string | null;
        }>;
        day?: string | null;
    }>;
    startDate?: NativeDate | null;
    location?: {
        postalCode: string;
        state: string;
        line1: string;
        line2: string;
    } | null;
    duration?: {
        session: number;
        hours: number;
    } | null;
    preference?: {
        others: string[];
        gender?: "male" | "female" | "other" | null;
    } | null;
} & mongoose.DefaultTimestampProps & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}, "id"> & {
    id: string;
}, mongoose.Schema<any, mongoose.Model<any, any, any, any, any, any, any>, {}, {}, {}, {}, {
    timestamps: true;
}, {
    status: "pending" | "rejected" | "approved";
    client: mongoose.Types.ObjectId;
    frequency: "daily" | "weekly" | "fortnightly" | "monthly";
    title: string;
    supportDetails: mongoose.Types.DocumentArray<{
        name: string;
        details: string[];
    }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, unknown, {
        name: string;
        details: string[];
    }> & {
        name: string;
        details: string[];
    }>;
    jobSessionByClient: boolean;
    hourlyRate: number;
    jobSessions: mongoose.Types.DocumentArray<{
        period: mongoose.Types.DocumentArray<{
            startTime?: string | null;
            endTime?: string | null;
        }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, unknown, {
            startTime?: string | null;
            endTime?: string | null;
        }> & {
            startTime?: string | null;
            endTime?: string | null;
        }>;
        day?: string | null;
    }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, unknown, {
        period: mongoose.Types.DocumentArray<{
            startTime?: string | null;
            endTime?: string | null;
        }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, unknown, {
            startTime?: string | null;
            endTime?: string | null;
        }> & {
            startTime?: string | null;
            endTime?: string | null;
        }>;
        day?: string | null;
    }> & {
        period: mongoose.Types.DocumentArray<{
            startTime?: string | null;
            endTime?: string | null;
        }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, unknown, {
            startTime?: string | null;
            endTime?: string | null;
        }> & {
            startTime?: string | null;
            endTime?: string | null;
        }>;
        day?: string | null;
    }>;
    startDate?: NativeDate | null;
    location?: {
        postalCode: string;
        state: string;
        line1: string;
        line2: string;
    } | null;
    duration?: {
        session: number;
        hours: number;
    } | null;
    preference?: {
        others: string[];
        gender?: "male" | "female" | "other" | null;
    } | null;
} & mongoose.DefaultTimestampProps, mongoose.Document<unknown, {}, {
    status: "pending" | "rejected" | "approved";
    client: mongoose.Types.ObjectId;
    frequency: "daily" | "weekly" | "fortnightly" | "monthly";
    title: string;
    supportDetails: mongoose.Types.DocumentArray<{
        name: string;
        details: string[];
    }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, unknown, {
        name: string;
        details: string[];
    }> & {
        name: string;
        details: string[];
    }>;
    jobSessionByClient: boolean;
    hourlyRate: number;
    jobSessions: mongoose.Types.DocumentArray<{
        period: mongoose.Types.DocumentArray<{
            startTime?: string | null;
            endTime?: string | null;
        }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, unknown, {
            startTime?: string | null;
            endTime?: string | null;
        }> & {
            startTime?: string | null;
            endTime?: string | null;
        }>;
        day?: string | null;
    }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, unknown, {
        period: mongoose.Types.DocumentArray<{
            startTime?: string | null;
            endTime?: string | null;
        }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, unknown, {
            startTime?: string | null;
            endTime?: string | null;
        }> & {
            startTime?: string | null;
            endTime?: string | null;
        }>;
        day?: string | null;
    }> & {
        period: mongoose.Types.DocumentArray<{
            startTime?: string | null;
            endTime?: string | null;
        }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, unknown, {
            startTime?: string | null;
            endTime?: string | null;
        }> & {
            startTime?: string | null;
            endTime?: string | null;
        }>;
        day?: string | null;
    }>;
    startDate?: NativeDate | null;
    location?: {
        postalCode: string;
        state: string;
        line1: string;
        line2: string;
    } | null;
    duration?: {
        session: number;
        hours: number;
    } | null;
    preference?: {
        others: string[];
        gender?: "male" | "female" | "other" | null;
    } | null;
} & mongoose.DefaultTimestampProps, {
    id: string;
}, mongoose.ResolveSchemaOptions<{
    timestamps: true;
}>> & Omit<{
    status: "pending" | "rejected" | "approved";
    client: mongoose.Types.ObjectId;
    frequency: "daily" | "weekly" | "fortnightly" | "monthly";
    title: string;
    supportDetails: mongoose.Types.DocumentArray<{
        name: string;
        details: string[];
    }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, unknown, {
        name: string;
        details: string[];
    }> & {
        name: string;
        details: string[];
    }>;
    jobSessionByClient: boolean;
    hourlyRate: number;
    jobSessions: mongoose.Types.DocumentArray<{
        period: mongoose.Types.DocumentArray<{
            startTime?: string | null;
            endTime?: string | null;
        }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, unknown, {
            startTime?: string | null;
            endTime?: string | null;
        }> & {
            startTime?: string | null;
            endTime?: string | null;
        }>;
        day?: string | null;
    }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, unknown, {
        period: mongoose.Types.DocumentArray<{
            startTime?: string | null;
            endTime?: string | null;
        }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, unknown, {
            startTime?: string | null;
            endTime?: string | null;
        }> & {
            startTime?: string | null;
            endTime?: string | null;
        }>;
        day?: string | null;
    }> & {
        period: mongoose.Types.DocumentArray<{
            startTime?: string | null;
            endTime?: string | null;
        }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, unknown, {
            startTime?: string | null;
            endTime?: string | null;
        }> & {
            startTime?: string | null;
            endTime?: string | null;
        }>;
        day?: string | null;
    }>;
    startDate?: NativeDate | null;
    location?: {
        postalCode: string;
        state: string;
        line1: string;
        line2: string;
    } | null;
    duration?: {
        session: number;
        hours: number;
    } | null;
    preference?: {
        others: string[];
        gender?: "male" | "female" | "other" | null;
    } | null;
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
        status: "pending" | "rejected" | "approved";
        client: mongoose.Types.ObjectId;
        frequency: "daily" | "weekly" | "fortnightly" | "monthly";
        title: string;
        supportDetails: mongoose.Types.DocumentArray<{
            name: string;
            details: string[];
        }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, unknown, {
            name: string;
            details: string[];
        }> & {
            name: string;
            details: string[];
        }>;
        jobSessionByClient: boolean;
        hourlyRate: number;
        jobSessions: mongoose.Types.DocumentArray<{
            period: mongoose.Types.DocumentArray<{
                startTime?: string | null;
                endTime?: string | null;
            }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, unknown, {
                startTime?: string | null;
                endTime?: string | null;
            }> & {
                startTime?: string | null;
                endTime?: string | null;
            }>;
            day?: string | null;
        }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, unknown, {
            period: mongoose.Types.DocumentArray<{
                startTime?: string | null;
                endTime?: string | null;
            }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, unknown, {
                startTime?: string | null;
                endTime?: string | null;
            }> & {
                startTime?: string | null;
                endTime?: string | null;
            }>;
            day?: string | null;
        }> & {
            period: mongoose.Types.DocumentArray<{
                startTime?: string | null;
                endTime?: string | null;
            }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, unknown, {
                startTime?: string | null;
                endTime?: string | null;
            }> & {
                startTime?: string | null;
                endTime?: string | null;
            }>;
            day?: string | null;
        }>;
        startDate?: NativeDate | null;
        location?: {
            postalCode: string;
            state: string;
            line1: string;
            line2: string;
        } | null;
        duration?: {
            session: number;
            hours: number;
        } | null;
        preference?: {
            others: string[];
            gender?: "male" | "female" | "other" | null;
        } | null;
    } & mongoose.DefaultTimestampProps, {
        id: string;
    }, mongoose.ResolveSchemaOptions<{
        timestamps: true;
    }>> & Omit<{
        status: "pending" | "rejected" | "approved";
        client: mongoose.Types.ObjectId;
        frequency: "daily" | "weekly" | "fortnightly" | "monthly";
        title: string;
        supportDetails: mongoose.Types.DocumentArray<{
            name: string;
            details: string[];
        }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, unknown, {
            name: string;
            details: string[];
        }> & {
            name: string;
            details: string[];
        }>;
        jobSessionByClient: boolean;
        hourlyRate: number;
        jobSessions: mongoose.Types.DocumentArray<{
            period: mongoose.Types.DocumentArray<{
                startTime?: string | null;
                endTime?: string | null;
            }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, unknown, {
                startTime?: string | null;
                endTime?: string | null;
            }> & {
                startTime?: string | null;
                endTime?: string | null;
            }>;
            day?: string | null;
        }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, unknown, {
            period: mongoose.Types.DocumentArray<{
                startTime?: string | null;
                endTime?: string | null;
            }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, unknown, {
                startTime?: string | null;
                endTime?: string | null;
            }> & {
                startTime?: string | null;
                endTime?: string | null;
            }>;
            day?: string | null;
        }> & {
            period: mongoose.Types.DocumentArray<{
                startTime?: string | null;
                endTime?: string | null;
            }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, unknown, {
                startTime?: string | null;
                endTime?: string | null;
            }> & {
                startTime?: string | null;
                endTime?: string | null;
            }>;
            day?: string | null;
        }>;
        startDate?: NativeDate | null;
        location?: {
            postalCode: string;
            state: string;
            line1: string;
            line2: string;
        } | null;
        duration?: {
            session: number;
            hours: number;
        } | null;
        preference?: {
            others: string[];
            gender?: "male" | "female" | "other" | null;
        } | null;
    } & mongoose.DefaultTimestampProps & {
        _id: mongoose.Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
}, {
    status: "pending" | "rejected" | "approved";
    client: mongoose.Types.ObjectId;
    frequency: "daily" | "weekly" | "fortnightly" | "monthly";
    title: string;
    supportDetails: mongoose.Types.DocumentArray<{
        name: string;
        details: string[];
    }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, unknown, {
        name: string;
        details: string[];
    }> & {
        name: string;
        details: string[];
    }>;
    jobSessionByClient: boolean;
    hourlyRate: number;
    jobSessions: mongoose.Types.DocumentArray<{
        period: mongoose.Types.DocumentArray<{
            startTime?: string | null;
            endTime?: string | null;
        }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, unknown, {
            startTime?: string | null;
            endTime?: string | null;
        }> & {
            startTime?: string | null;
            endTime?: string | null;
        }>;
        day?: string | null;
    } | {
        period: mongoose.Types.DocumentArray<{
            startTime?: string | null;
            endTime?: string | null;
        }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, unknown, {
            startTime?: string | null;
            endTime?: string | null;
        }> & {
            startTime?: string | null;
            endTime?: string | null;
        }>;
        day?: string | null;
        _id: string;
    } | {
        period: mongoose.Types.DocumentArray<{
            startTime?: string | null;
            endTime?: string | null;
        }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, unknown, {
            startTime?: string | null;
            endTime?: string | null;
        }> & {
            startTime?: string | null;
            endTime?: string | null;
        }>;
        day?: string | null;
        _id: string;
    }, mongoose.Types.Subdocument<string | mongoose.mongo.BSON.ObjectId, unknown, {
        period: mongoose.Types.DocumentArray<{
            startTime?: string | null;
            endTime?: string | null;
        }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, unknown, {
            startTime?: string | null;
            endTime?: string | null;
        }> & {
            startTime?: string | null;
            endTime?: string | null;
        }>;
        day?: string | null;
    } | {
        period: mongoose.Types.DocumentArray<{
            startTime?: string | null;
            endTime?: string | null;
        }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, unknown, {
            startTime?: string | null;
            endTime?: string | null;
        }> & {
            startTime?: string | null;
            endTime?: string | null;
        }>;
        day?: string | null;
        _id: string;
    } | {
        period: mongoose.Types.DocumentArray<{
            startTime?: string | null;
            endTime?: string | null;
        }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, unknown, {
            startTime?: string | null;
            endTime?: string | null;
        }> & {
            startTime?: string | null;
            endTime?: string | null;
        }>;
        day?: string | null;
        _id: string;
    }> & ({
        period: mongoose.Types.DocumentArray<{
            startTime?: string | null;
            endTime?: string | null;
        }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, unknown, {
            startTime?: string | null;
            endTime?: string | null;
        }> & {
            startTime?: string | null;
            endTime?: string | null;
        }>;
        day?: string | null;
    } | {
        period: mongoose.Types.DocumentArray<{
            startTime?: string | null;
            endTime?: string | null;
        }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, unknown, {
            startTime?: string | null;
            endTime?: string | null;
        }> & {
            startTime?: string | null;
            endTime?: string | null;
        }>;
        day?: string | null;
        _id: string;
    } | {
        period: mongoose.Types.DocumentArray<{
            startTime?: string | null;
            endTime?: string | null;
        }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, unknown, {
            startTime?: string | null;
            endTime?: string | null;
        }> & {
            startTime?: string | null;
            endTime?: string | null;
        }>;
        day?: string | null;
        _id: string;
    })>;
    startDate?: NativeDate | null;
    location?: {
        postalCode: string;
        state: string;
        line1: string;
        line2: string;
    } | null;
    duration?: {
        session: number;
        hours: number;
    } | null;
    preference?: {
        others: string[];
        gender?: "male" | "female" | "other" | null;
    } | null;
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}>, {
    status: "pending" | "rejected" | "approved";
    client: mongoose.Types.ObjectId;
    frequency: "daily" | "weekly" | "fortnightly" | "monthly";
    title: string;
    supportDetails: mongoose.Types.DocumentArray<{
        name: string;
        details: string[];
    }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, unknown, {
        name: string;
        details: string[];
    }> & {
        name: string;
        details: string[];
    }>;
    jobSessionByClient: boolean;
    hourlyRate: number;
    jobSessions: mongoose.Types.DocumentArray<{
        period: mongoose.Types.DocumentArray<{
            startTime?: string | null;
            endTime?: string | null;
        }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, unknown, {
            startTime?: string | null;
            endTime?: string | null;
        }> & {
            startTime?: string | null;
            endTime?: string | null;
        }>;
        day?: string | null;
    } | {
        period: mongoose.Types.DocumentArray<{
            startTime?: string | null;
            endTime?: string | null;
        }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, unknown, {
            startTime?: string | null;
            endTime?: string | null;
        }> & {
            startTime?: string | null;
            endTime?: string | null;
        }>;
        day?: string | null;
        _id: string;
    } | {
        period: mongoose.Types.DocumentArray<{
            startTime?: string | null;
            endTime?: string | null;
        }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, unknown, {
            startTime?: string | null;
            endTime?: string | null;
        }> & {
            startTime?: string | null;
            endTime?: string | null;
        }>;
        day?: string | null;
        _id: string;
    }, mongoose.Types.Subdocument<string | mongoose.mongo.BSON.ObjectId, unknown, {
        period: mongoose.Types.DocumentArray<{
            startTime?: string | null;
            endTime?: string | null;
        }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, unknown, {
            startTime?: string | null;
            endTime?: string | null;
        }> & {
            startTime?: string | null;
            endTime?: string | null;
        }>;
        day?: string | null;
    } | {
        period: mongoose.Types.DocumentArray<{
            startTime?: string | null;
            endTime?: string | null;
        }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, unknown, {
            startTime?: string | null;
            endTime?: string | null;
        }> & {
            startTime?: string | null;
            endTime?: string | null;
        }>;
        day?: string | null;
        _id: string;
    } | {
        period: mongoose.Types.DocumentArray<{
            startTime?: string | null;
            endTime?: string | null;
        }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, unknown, {
            startTime?: string | null;
            endTime?: string | null;
        }> & {
            startTime?: string | null;
            endTime?: string | null;
        }>;
        day?: string | null;
        _id: string;
    }> & ({
        period: mongoose.Types.DocumentArray<{
            startTime?: string | null;
            endTime?: string | null;
        }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, unknown, {
            startTime?: string | null;
            endTime?: string | null;
        }> & {
            startTime?: string | null;
            endTime?: string | null;
        }>;
        day?: string | null;
    } | {
        period: mongoose.Types.DocumentArray<{
            startTime?: string | null;
            endTime?: string | null;
        }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, unknown, {
            startTime?: string | null;
            endTime?: string | null;
        }> & {
            startTime?: string | null;
            endTime?: string | null;
        }>;
        day?: string | null;
        _id: string;
    } | {
        period: mongoose.Types.DocumentArray<{
            startTime?: string | null;
            endTime?: string | null;
        }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, unknown, {
            startTime?: string | null;
            endTime?: string | null;
        }> & {
            startTime?: string | null;
            endTime?: string | null;
        }>;
        day?: string | null;
        _id: string;
    })>;
    startDate?: NativeDate | null;
    location?: {
        postalCode: string;
        state: string;
        line1: string;
        line2: string;
    } | null;
    duration?: {
        session: number;
        hours: number;
    } | null;
    preference?: {
        others: string[];
        gender?: "male" | "female" | "other" | null;
    } | null;
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}>;
export type JobDocument = mongoose.InferSchemaType<typeof jobSchema>;
export {};
//# sourceMappingURL=job.model.d.ts.map