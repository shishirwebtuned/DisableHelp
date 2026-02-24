import mongoose from "mongoose";
declare const applicationSchema: mongoose.Schema<any, mongoose.Model<any, any, any, any, any, any, any>, {}, {}, {}, {}, {
    timestamps: true;
}, {
    availability: mongoose.Types.DocumentArray<{
        day: string;
        period: mongoose.Types.DocumentArray<{
            startTime: string;
            endTime: string;
        }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, unknown, {
            startTime: string;
            endTime: string;
        }> & {
            startTime: string;
            endTime: string;
        }>;
    }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, unknown, {
        day: string;
        period: mongoose.Types.DocumentArray<{
            startTime: string;
            endTime: string;
        }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, unknown, {
            startTime: string;
            endTime: string;
        }> & {
            startTime: string;
            endTime: string;
        }>;
    }> & {
        day: string;
        period: mongoose.Types.DocumentArray<{
            startTime: string;
            endTime: string;
        }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, unknown, {
            startTime: string;
            endTime: string;
        }> & {
            startTime: string;
            endTime: string;
        }>;
    }>;
    status: "pending" | "rejected" | "accepted";
    job: mongoose.Types.ObjectId;
    applicant: mongoose.Types.ObjectId;
    introduction: string;
    skills: string;
} & mongoose.DefaultTimestampProps, mongoose.Document<unknown, {}, {
    availability: mongoose.Types.DocumentArray<{
        day: string;
        period: mongoose.Types.DocumentArray<{
            startTime: string;
            endTime: string;
        }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, unknown, {
            startTime: string;
            endTime: string;
        }> & {
            startTime: string;
            endTime: string;
        }>;
    }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, unknown, {
        day: string;
        period: mongoose.Types.DocumentArray<{
            startTime: string;
            endTime: string;
        }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, unknown, {
            startTime: string;
            endTime: string;
        }> & {
            startTime: string;
            endTime: string;
        }>;
    }> & {
        day: string;
        period: mongoose.Types.DocumentArray<{
            startTime: string;
            endTime: string;
        }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, unknown, {
            startTime: string;
            endTime: string;
        }> & {
            startTime: string;
            endTime: string;
        }>;
    }>;
    status: "pending" | "rejected" | "accepted";
    job: mongoose.Types.ObjectId;
    applicant: mongoose.Types.ObjectId;
    introduction: string;
    skills: string;
} & mongoose.DefaultTimestampProps, {
    id: string;
}, mongoose.ResolveSchemaOptions<{
    timestamps: true;
}>> & Omit<{
    availability: mongoose.Types.DocumentArray<{
        day: string;
        period: mongoose.Types.DocumentArray<{
            startTime: string;
            endTime: string;
        }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, unknown, {
            startTime: string;
            endTime: string;
        }> & {
            startTime: string;
            endTime: string;
        }>;
    }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, unknown, {
        day: string;
        period: mongoose.Types.DocumentArray<{
            startTime: string;
            endTime: string;
        }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, unknown, {
            startTime: string;
            endTime: string;
        }> & {
            startTime: string;
            endTime: string;
        }>;
    }> & {
        day: string;
        period: mongoose.Types.DocumentArray<{
            startTime: string;
            endTime: string;
        }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, unknown, {
            startTime: string;
            endTime: string;
        }> & {
            startTime: string;
            endTime: string;
        }>;
    }>;
    status: "pending" | "rejected" | "accepted";
    job: mongoose.Types.ObjectId;
    applicant: mongoose.Types.ObjectId;
    introduction: string;
    skills: string;
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
        availability: mongoose.Types.DocumentArray<{
            day: string;
            period: mongoose.Types.DocumentArray<{
                startTime: string;
                endTime: string;
            }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, unknown, {
                startTime: string;
                endTime: string;
            }> & {
                startTime: string;
                endTime: string;
            }>;
        }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, unknown, {
            day: string;
            period: mongoose.Types.DocumentArray<{
                startTime: string;
                endTime: string;
            }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, unknown, {
                startTime: string;
                endTime: string;
            }> & {
                startTime: string;
                endTime: string;
            }>;
        }> & {
            day: string;
            period: mongoose.Types.DocumentArray<{
                startTime: string;
                endTime: string;
            }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, unknown, {
                startTime: string;
                endTime: string;
            }> & {
                startTime: string;
                endTime: string;
            }>;
        }>;
        status: "pending" | "rejected" | "accepted";
        job: mongoose.Types.ObjectId;
        applicant: mongoose.Types.ObjectId;
        introduction: string;
        skills: string;
    } & mongoose.DefaultTimestampProps, {
        id: string;
    }, mongoose.ResolveSchemaOptions<{
        timestamps: true;
    }>> & Omit<{
        availability: mongoose.Types.DocumentArray<{
            day: string;
            period: mongoose.Types.DocumentArray<{
                startTime: string;
                endTime: string;
            }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, unknown, {
                startTime: string;
                endTime: string;
            }> & {
                startTime: string;
                endTime: string;
            }>;
        }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, unknown, {
            day: string;
            period: mongoose.Types.DocumentArray<{
                startTime: string;
                endTime: string;
            }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, unknown, {
                startTime: string;
                endTime: string;
            }> & {
                startTime: string;
                endTime: string;
            }>;
        }> & {
            day: string;
            period: mongoose.Types.DocumentArray<{
                startTime: string;
                endTime: string;
            }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, unknown, {
                startTime: string;
                endTime: string;
            }> & {
                startTime: string;
                endTime: string;
            }>;
        }>;
        status: "pending" | "rejected" | "accepted";
        job: mongoose.Types.ObjectId;
        applicant: mongoose.Types.ObjectId;
        introduction: string;
        skills: string;
    } & mongoose.DefaultTimestampProps & {
        _id: mongoose.Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
}, {
    availability: mongoose.Types.DocumentArray<{
        day: string;
        period: mongoose.Types.DocumentArray<{
            startTime: string;
            endTime: string;
        }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, unknown, {
            startTime: string;
            endTime: string;
        }> & {
            startTime: string;
            endTime: string;
        }>;
    } | {
        day: string;
        period: mongoose.Types.DocumentArray<{
            startTime: string;
            endTime: string;
        }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, unknown, {
            startTime: string;
            endTime: string;
        }> & {
            startTime: string;
            endTime: string;
        }>;
        _id: string;
    } | {
        day: string;
        period: mongoose.Types.DocumentArray<{
            startTime: string;
            endTime: string;
        }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, unknown, {
            startTime: string;
            endTime: string;
        }> & {
            startTime: string;
            endTime: string;
        }>;
        _id: string;
    }, mongoose.Types.Subdocument<string | mongoose.mongo.BSON.ObjectId, unknown, {
        day: string;
        period: mongoose.Types.DocumentArray<{
            startTime: string;
            endTime: string;
        }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, unknown, {
            startTime: string;
            endTime: string;
        }> & {
            startTime: string;
            endTime: string;
        }>;
    } | {
        day: string;
        period: mongoose.Types.DocumentArray<{
            startTime: string;
            endTime: string;
        }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, unknown, {
            startTime: string;
            endTime: string;
        }> & {
            startTime: string;
            endTime: string;
        }>;
        _id: string;
    } | {
        day: string;
        period: mongoose.Types.DocumentArray<{
            startTime: string;
            endTime: string;
        }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, unknown, {
            startTime: string;
            endTime: string;
        }> & {
            startTime: string;
            endTime: string;
        }>;
        _id: string;
    }> & ({
        day: string;
        period: mongoose.Types.DocumentArray<{
            startTime: string;
            endTime: string;
        }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, unknown, {
            startTime: string;
            endTime: string;
        }> & {
            startTime: string;
            endTime: string;
        }>;
    } | {
        day: string;
        period: mongoose.Types.DocumentArray<{
            startTime: string;
            endTime: string;
        }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, unknown, {
            startTime: string;
            endTime: string;
        }> & {
            startTime: string;
            endTime: string;
        }>;
        _id: string;
    } | {
        day: string;
        period: mongoose.Types.DocumentArray<{
            startTime: string;
            endTime: string;
        }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, unknown, {
            startTime: string;
            endTime: string;
        }> & {
            startTime: string;
            endTime: string;
        }>;
        _id: string;
    })>;
    status: "pending" | "rejected" | "accepted";
    job: mongoose.Types.ObjectId;
    applicant: mongoose.Types.ObjectId;
    introduction: string;
    skills: string;
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}>;
export declare const Application: mongoose.Model<{
    availability: mongoose.Types.DocumentArray<{
        day: string;
        period: mongoose.Types.DocumentArray<{
            startTime: string;
            endTime: string;
        }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, unknown, {
            startTime: string;
            endTime: string;
        }> & {
            startTime: string;
            endTime: string;
        }>;
    }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, unknown, {
        day: string;
        period: mongoose.Types.DocumentArray<{
            startTime: string;
            endTime: string;
        }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, unknown, {
            startTime: string;
            endTime: string;
        }> & {
            startTime: string;
            endTime: string;
        }>;
    }> & {
        day: string;
        period: mongoose.Types.DocumentArray<{
            startTime: string;
            endTime: string;
        }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, unknown, {
            startTime: string;
            endTime: string;
        }> & {
            startTime: string;
            endTime: string;
        }>;
    }>;
    status: "pending" | "rejected" | "accepted";
    job: mongoose.Types.ObjectId;
    applicant: mongoose.Types.ObjectId;
    introduction: string;
    skills: string;
} & mongoose.DefaultTimestampProps, {}, {}, {
    id: string;
}, mongoose.Document<unknown, {}, {
    availability: mongoose.Types.DocumentArray<{
        day: string;
        period: mongoose.Types.DocumentArray<{
            startTime: string;
            endTime: string;
        }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, unknown, {
            startTime: string;
            endTime: string;
        }> & {
            startTime: string;
            endTime: string;
        }>;
    }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, unknown, {
        day: string;
        period: mongoose.Types.DocumentArray<{
            startTime: string;
            endTime: string;
        }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, unknown, {
            startTime: string;
            endTime: string;
        }> & {
            startTime: string;
            endTime: string;
        }>;
    }> & {
        day: string;
        period: mongoose.Types.DocumentArray<{
            startTime: string;
            endTime: string;
        }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, unknown, {
            startTime: string;
            endTime: string;
        }> & {
            startTime: string;
            endTime: string;
        }>;
    }>;
    status: "pending" | "rejected" | "accepted";
    job: mongoose.Types.ObjectId;
    applicant: mongoose.Types.ObjectId;
    introduction: string;
    skills: string;
} & mongoose.DefaultTimestampProps, {
    id: string;
}, {
    timestamps: true;
}> & Omit<{
    availability: mongoose.Types.DocumentArray<{
        day: string;
        period: mongoose.Types.DocumentArray<{
            startTime: string;
            endTime: string;
        }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, unknown, {
            startTime: string;
            endTime: string;
        }> & {
            startTime: string;
            endTime: string;
        }>;
    }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, unknown, {
        day: string;
        period: mongoose.Types.DocumentArray<{
            startTime: string;
            endTime: string;
        }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, unknown, {
            startTime: string;
            endTime: string;
        }> & {
            startTime: string;
            endTime: string;
        }>;
    }> & {
        day: string;
        period: mongoose.Types.DocumentArray<{
            startTime: string;
            endTime: string;
        }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, unknown, {
            startTime: string;
            endTime: string;
        }> & {
            startTime: string;
            endTime: string;
        }>;
    }>;
    status: "pending" | "rejected" | "accepted";
    job: mongoose.Types.ObjectId;
    applicant: mongoose.Types.ObjectId;
    introduction: string;
    skills: string;
} & mongoose.DefaultTimestampProps & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}, "id"> & {
    id: string;
}, mongoose.Schema<any, mongoose.Model<any, any, any, any, any, any, any>, {}, {}, {}, {}, {
    timestamps: true;
}, {
    availability: mongoose.Types.DocumentArray<{
        day: string;
        period: mongoose.Types.DocumentArray<{
            startTime: string;
            endTime: string;
        }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, unknown, {
            startTime: string;
            endTime: string;
        }> & {
            startTime: string;
            endTime: string;
        }>;
    }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, unknown, {
        day: string;
        period: mongoose.Types.DocumentArray<{
            startTime: string;
            endTime: string;
        }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, unknown, {
            startTime: string;
            endTime: string;
        }> & {
            startTime: string;
            endTime: string;
        }>;
    }> & {
        day: string;
        period: mongoose.Types.DocumentArray<{
            startTime: string;
            endTime: string;
        }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, unknown, {
            startTime: string;
            endTime: string;
        }> & {
            startTime: string;
            endTime: string;
        }>;
    }>;
    status: "pending" | "rejected" | "accepted";
    job: mongoose.Types.ObjectId;
    applicant: mongoose.Types.ObjectId;
    introduction: string;
    skills: string;
} & mongoose.DefaultTimestampProps, mongoose.Document<unknown, {}, {
    availability: mongoose.Types.DocumentArray<{
        day: string;
        period: mongoose.Types.DocumentArray<{
            startTime: string;
            endTime: string;
        }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, unknown, {
            startTime: string;
            endTime: string;
        }> & {
            startTime: string;
            endTime: string;
        }>;
    }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, unknown, {
        day: string;
        period: mongoose.Types.DocumentArray<{
            startTime: string;
            endTime: string;
        }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, unknown, {
            startTime: string;
            endTime: string;
        }> & {
            startTime: string;
            endTime: string;
        }>;
    }> & {
        day: string;
        period: mongoose.Types.DocumentArray<{
            startTime: string;
            endTime: string;
        }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, unknown, {
            startTime: string;
            endTime: string;
        }> & {
            startTime: string;
            endTime: string;
        }>;
    }>;
    status: "pending" | "rejected" | "accepted";
    job: mongoose.Types.ObjectId;
    applicant: mongoose.Types.ObjectId;
    introduction: string;
    skills: string;
} & mongoose.DefaultTimestampProps, {
    id: string;
}, mongoose.ResolveSchemaOptions<{
    timestamps: true;
}>> & Omit<{
    availability: mongoose.Types.DocumentArray<{
        day: string;
        period: mongoose.Types.DocumentArray<{
            startTime: string;
            endTime: string;
        }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, unknown, {
            startTime: string;
            endTime: string;
        }> & {
            startTime: string;
            endTime: string;
        }>;
    }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, unknown, {
        day: string;
        period: mongoose.Types.DocumentArray<{
            startTime: string;
            endTime: string;
        }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, unknown, {
            startTime: string;
            endTime: string;
        }> & {
            startTime: string;
            endTime: string;
        }>;
    }> & {
        day: string;
        period: mongoose.Types.DocumentArray<{
            startTime: string;
            endTime: string;
        }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, unknown, {
            startTime: string;
            endTime: string;
        }> & {
            startTime: string;
            endTime: string;
        }>;
    }>;
    status: "pending" | "rejected" | "accepted";
    job: mongoose.Types.ObjectId;
    applicant: mongoose.Types.ObjectId;
    introduction: string;
    skills: string;
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
        availability: mongoose.Types.DocumentArray<{
            day: string;
            period: mongoose.Types.DocumentArray<{
                startTime: string;
                endTime: string;
            }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, unknown, {
                startTime: string;
                endTime: string;
            }> & {
                startTime: string;
                endTime: string;
            }>;
        }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, unknown, {
            day: string;
            period: mongoose.Types.DocumentArray<{
                startTime: string;
                endTime: string;
            }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, unknown, {
                startTime: string;
                endTime: string;
            }> & {
                startTime: string;
                endTime: string;
            }>;
        }> & {
            day: string;
            period: mongoose.Types.DocumentArray<{
                startTime: string;
                endTime: string;
            }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, unknown, {
                startTime: string;
                endTime: string;
            }> & {
                startTime: string;
                endTime: string;
            }>;
        }>;
        status: "pending" | "rejected" | "accepted";
        job: mongoose.Types.ObjectId;
        applicant: mongoose.Types.ObjectId;
        introduction: string;
        skills: string;
    } & mongoose.DefaultTimestampProps, {
        id: string;
    }, mongoose.ResolveSchemaOptions<{
        timestamps: true;
    }>> & Omit<{
        availability: mongoose.Types.DocumentArray<{
            day: string;
            period: mongoose.Types.DocumentArray<{
                startTime: string;
                endTime: string;
            }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, unknown, {
                startTime: string;
                endTime: string;
            }> & {
                startTime: string;
                endTime: string;
            }>;
        }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, unknown, {
            day: string;
            period: mongoose.Types.DocumentArray<{
                startTime: string;
                endTime: string;
            }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, unknown, {
                startTime: string;
                endTime: string;
            }> & {
                startTime: string;
                endTime: string;
            }>;
        }> & {
            day: string;
            period: mongoose.Types.DocumentArray<{
                startTime: string;
                endTime: string;
            }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, unknown, {
                startTime: string;
                endTime: string;
            }> & {
                startTime: string;
                endTime: string;
            }>;
        }>;
        status: "pending" | "rejected" | "accepted";
        job: mongoose.Types.ObjectId;
        applicant: mongoose.Types.ObjectId;
        introduction: string;
        skills: string;
    } & mongoose.DefaultTimestampProps & {
        _id: mongoose.Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
}, {
    availability: mongoose.Types.DocumentArray<{
        day: string;
        period: mongoose.Types.DocumentArray<{
            startTime: string;
            endTime: string;
        }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, unknown, {
            startTime: string;
            endTime: string;
        }> & {
            startTime: string;
            endTime: string;
        }>;
    } | {
        day: string;
        period: mongoose.Types.DocumentArray<{
            startTime: string;
            endTime: string;
        }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, unknown, {
            startTime: string;
            endTime: string;
        }> & {
            startTime: string;
            endTime: string;
        }>;
        _id: string;
    } | {
        day: string;
        period: mongoose.Types.DocumentArray<{
            startTime: string;
            endTime: string;
        }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, unknown, {
            startTime: string;
            endTime: string;
        }> & {
            startTime: string;
            endTime: string;
        }>;
        _id: string;
    }, mongoose.Types.Subdocument<string | mongoose.mongo.BSON.ObjectId, unknown, {
        day: string;
        period: mongoose.Types.DocumentArray<{
            startTime: string;
            endTime: string;
        }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, unknown, {
            startTime: string;
            endTime: string;
        }> & {
            startTime: string;
            endTime: string;
        }>;
    } | {
        day: string;
        period: mongoose.Types.DocumentArray<{
            startTime: string;
            endTime: string;
        }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, unknown, {
            startTime: string;
            endTime: string;
        }> & {
            startTime: string;
            endTime: string;
        }>;
        _id: string;
    } | {
        day: string;
        period: mongoose.Types.DocumentArray<{
            startTime: string;
            endTime: string;
        }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, unknown, {
            startTime: string;
            endTime: string;
        }> & {
            startTime: string;
            endTime: string;
        }>;
        _id: string;
    }> & ({
        day: string;
        period: mongoose.Types.DocumentArray<{
            startTime: string;
            endTime: string;
        }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, unknown, {
            startTime: string;
            endTime: string;
        }> & {
            startTime: string;
            endTime: string;
        }>;
    } | {
        day: string;
        period: mongoose.Types.DocumentArray<{
            startTime: string;
            endTime: string;
        }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, unknown, {
            startTime: string;
            endTime: string;
        }> & {
            startTime: string;
            endTime: string;
        }>;
        _id: string;
    } | {
        day: string;
        period: mongoose.Types.DocumentArray<{
            startTime: string;
            endTime: string;
        }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, unknown, {
            startTime: string;
            endTime: string;
        }> & {
            startTime: string;
            endTime: string;
        }>;
        _id: string;
    })>;
    status: "pending" | "rejected" | "accepted";
    job: mongoose.Types.ObjectId;
    applicant: mongoose.Types.ObjectId;
    introduction: string;
    skills: string;
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}>, {
    availability: mongoose.Types.DocumentArray<{
        day: string;
        period: mongoose.Types.DocumentArray<{
            startTime: string;
            endTime: string;
        }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, unknown, {
            startTime: string;
            endTime: string;
        }> & {
            startTime: string;
            endTime: string;
        }>;
    } | {
        day: string;
        period: mongoose.Types.DocumentArray<{
            startTime: string;
            endTime: string;
        }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, unknown, {
            startTime: string;
            endTime: string;
        }> & {
            startTime: string;
            endTime: string;
        }>;
        _id: string;
    } | {
        day: string;
        period: mongoose.Types.DocumentArray<{
            startTime: string;
            endTime: string;
        }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, unknown, {
            startTime: string;
            endTime: string;
        }> & {
            startTime: string;
            endTime: string;
        }>;
        _id: string;
    }, mongoose.Types.Subdocument<string | mongoose.mongo.BSON.ObjectId, unknown, {
        day: string;
        period: mongoose.Types.DocumentArray<{
            startTime: string;
            endTime: string;
        }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, unknown, {
            startTime: string;
            endTime: string;
        }> & {
            startTime: string;
            endTime: string;
        }>;
    } | {
        day: string;
        period: mongoose.Types.DocumentArray<{
            startTime: string;
            endTime: string;
        }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, unknown, {
            startTime: string;
            endTime: string;
        }> & {
            startTime: string;
            endTime: string;
        }>;
        _id: string;
    } | {
        day: string;
        period: mongoose.Types.DocumentArray<{
            startTime: string;
            endTime: string;
        }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, unknown, {
            startTime: string;
            endTime: string;
        }> & {
            startTime: string;
            endTime: string;
        }>;
        _id: string;
    }> & ({
        day: string;
        period: mongoose.Types.DocumentArray<{
            startTime: string;
            endTime: string;
        }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, unknown, {
            startTime: string;
            endTime: string;
        }> & {
            startTime: string;
            endTime: string;
        }>;
    } | {
        day: string;
        period: mongoose.Types.DocumentArray<{
            startTime: string;
            endTime: string;
        }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, unknown, {
            startTime: string;
            endTime: string;
        }> & {
            startTime: string;
            endTime: string;
        }>;
        _id: string;
    } | {
        day: string;
        period: mongoose.Types.DocumentArray<{
            startTime: string;
            endTime: string;
        }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, unknown, {
            startTime: string;
            endTime: string;
        }> & {
            startTime: string;
            endTime: string;
        }>;
        _id: string;
    })>;
    status: "pending" | "rejected" | "accepted";
    job: mongoose.Types.ObjectId;
    applicant: mongoose.Types.ObjectId;
    introduction: string;
    skills: string;
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}>;
export type ApplicationDocument = mongoose.InferSchemaType<typeof applicationSchema>;
export {};
//# sourceMappingURL=application.model.d.ts.map