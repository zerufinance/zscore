/** Stable error codes for agent runtimes */
export const ErrorCode = {
    RPC_ERROR: "RPC_ERROR",
    API_ERROR: "API_ERROR",
    VALIDATION_ERROR: "VALIDATION_ERROR",
};
export class ZscoreError extends Error {
    code;
    details;
    constructor(code, message, details) {
        super(message);
        this.code = code;
        this.details = details;
        this.name = "ZscoreError";
        Object.setPrototypeOf(this, ZscoreError.prototype);
    }
}
export function rpcError(message, details) {
    return new ZscoreError(ErrorCode.RPC_ERROR, message, details);
}
export function apiError(message, status, body) {
    return new ZscoreError(ErrorCode.API_ERROR, message, { status, body });
}
export function validationError(message, fields) {
    return new ZscoreError(ErrorCode.VALIDATION_ERROR, message, { fields });
}
