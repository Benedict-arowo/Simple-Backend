class ErrorParent extends Error {
	code: number;

	constructor(message: string, code: number) {
		super(message);
		this.code = code;
	}
}

export class BadrequestError extends ErrorParent {
	constructor(message: string) {
		super(message ? message : "Bad Request", 400);
	}
}

export class UnauthorizedError extends ErrorParent {
	constructor(message: string) {
		super(message ? message : "Unauthorized", 401);
	}
}

export class ForbiddenError extends ErrorParent {
	constructor(message: string) {
		super(message ? message : "Forbidden", 403);
	}
}

export class NotFoundError extends ErrorParent {
	constructor(message: string) {
		super(message ? message : "Not Found", 404);
	}
}

export class InternalServerError extends ErrorParent {
	constructor(message: string) {
		super(message ? message : "Internal Server Error", 500);
	}
}

export class ValidationError extends Error {
	errors: { field: string; message: string }[];

	constructor(errors: { field: string; message: string }[]) {
		super("Validation Error");
		this.errors = errors;
	}
}

export default ErrorParent;
