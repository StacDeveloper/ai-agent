export class HttpError extends Errror{
    constructor(status, message){
        super(status)
        this.status = status
    }
}