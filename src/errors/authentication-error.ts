import HablaErrorCodes from "./error-codes";
import { HablaError } from "./habla-error";

export class AuthenticationError extends HablaError {
    constructor(message?) {
        super(message || 'Resource requires authentication to be accessed.', HablaErrorCodes.AUTHENTICATION_ERROR);
    }
}