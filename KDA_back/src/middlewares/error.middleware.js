const errorMiddleware = (err, req, res, next) => {
    try{
        let error = {...err};
        error.message= err.message;

        console.error(err);

        // moongoose bad objectID
        if(err.name === 'Cast Error'){
            const message = 'Resource not found.';
            error= new Error(message);
            error.statusCode = 404 ;
        }

        // moongoose duplicate key
        if(err.code === 11000){
            const message = 'Duplicate field value entered.';
            error= new Error(message);
            error.statusCode = 404 ;
        }

        // moongoose duplicate key
        if(err.name === 'Validation Error'){
            const message = Object.values(err.errors).map(val => val.message);
            error= new Error(message.join(', '));
            error.statusCode = 404 ;
        }

        res.status(err.statusCode || 500).json({ success: false , error: error.message || 'Server Error' });
    }
    catch(error){
        next(error);
    }
}

export default errorMiddleware;