const getPrismaError = (err) => {
    switch (err.code) {
        case "P2002":
            return {
                statusCode: 409,
                message: `Duplicate value for field: ${err.meta?.target?.join(", ") || "unique field"}`,
            };
        case "P2003":
            return {
                statusCode: 400,
                message: `Invalid relation: ${err.meta?.field_name || "foreign key constraint failed"}`,
            };
        case "P2025":
            return {
                statusCode: 404,
                message: "Resource not found",
            };
        default:
            return null;
    }
};

const getClientError = (err) => {
    if (err.name === "PrismaClientValidationError") {
        return {
            statusCode: 400,
            message: "Invalid request data",
        };
    }

    if (err.name === "PrismaClientInitializationError") {
        return {
            statusCode: 500,
            message: "Database connection error",
        };
    }

    return null;
};

const errorMiddleware = (err, req, res, next) => {
    try {
        console.error(err);

        const prismaError = getPrismaError(err);
        const clientError = getClientError(err);
        const handledError = prismaError || clientError;

        const statusCode = handledError?.statusCode || err.statusCode || 500;
        const message = handledError?.message || err.message || "Server Error";

        res.status(statusCode).json({
            success: false,
            error: message,
        });
    } catch (error) {
        next(error);
    }
};

export default errorMiddleware;
