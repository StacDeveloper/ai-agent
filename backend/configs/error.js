export class HttpError extends Error{
    constructor(status, message){
        super(status)
        this.status = status
    }
}