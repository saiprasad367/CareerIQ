"""
CareerIQ — Centralized error models and exception handlers.
"""
from __future__ import annotations

from typing import Any, Optional

from fastapi import FastAPI, Request, status
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from pydantic import BaseModel


# ---------------------------------------------------------------------------
# Standard error response shape
# ---------------------------------------------------------------------------
class ErrorDetail(BaseModel):
    code: str
    message: str
    field: Optional[str] = None


class ErrorResponse(BaseModel):
    error: ErrorDetail


def error_response(
    code: str,
    message: str,
    status_code: int,
    field: Optional[str] = None,
) -> JSONResponse:
    return JSONResponse(
        status_code=status_code,
        content={"error": {"code": code, "message": message, "field": field}},
    )


# ---------------------------------------------------------------------------
# Domain exceptions
# ---------------------------------------------------------------------------
class CareerIQError(Exception):
    """Base application error."""
    code: str = "internal_error"
    status_code: int = 500
    message: str = "An unexpected error occurred."

    def __init__(self, message: Optional[str] = None, **kwargs: Any):
        self.message = message or self.__class__.message
        super().__init__(self.message)


class NotFoundError(CareerIQError):
    code = "not_found"
    status_code = 404
    message = "Resource not found."


class ForbiddenError(CareerIQError):
    code = "forbidden"
    status_code = 403
    message = "You do not have permission to access this resource."


class UnauthorizedError(CareerIQError):
    code = "unauthorized"
    status_code = 401
    message = "Authentication required."


class ValidationError(CareerIQError):
    code = "validation_error"
    status_code = 422
    message = "Validation failed."


class ConflictError(CareerIQError):
    code = "conflict"
    status_code = 409
    message = "A conflicting resource already exists."


class FileTooLargeError(CareerIQError):
    code = "file_too_large"
    status_code = 413
    message = "Uploaded file exceeds the maximum allowed size."


class UnsupportedFileTypeError(CareerIQError):
    code = "unsupported_file_type"
    status_code = 415
    message = "Unsupported file type. Please upload a PDF or DOCX file."


class ParseError(CareerIQError):
    code = "parse_error"
    status_code = 422
    message = "File could not be parsed."


class RateLimitError(CareerIQError):
    code = "rate_limited"
    status_code = 429
    message = "Too many requests. Please try again later."


class BadRequestError(CareerIQError):
    code = "bad_request"
    status_code = 400
    message = "Bad request."


# Semantic aliases for convenience
AuthenticationError = UnauthorizedError
PermissionDeniedError = ForbiddenError


# ---------------------------------------------------------------------------
# Exception handlers to register on the FastAPI app
# ---------------------------------------------------------------------------
def register_exception_handlers(app: FastAPI) -> None:

    @app.exception_handler(CareerIQError)
    async def domain_error_handler(request: Request, exc: CareerIQError) -> JSONResponse:
        return error_response(exc.code, exc.message, exc.status_code)

    @app.exception_handler(RequestValidationError)
    async def validation_error_handler(
        request: Request, exc: RequestValidationError
    ) -> JSONResponse:
        # Surface the first validation error in the standard shape
        errors = exc.errors()
        first = errors[0] if errors else {}
        field = ".".join(str(loc) for loc in first.get("loc", [])) or None
        msg = first.get("msg", "Invalid input.")
        return JSONResponse(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            content={"error": {"code": "validation_error", "message": msg, "field": field}},
        )

    @app.exception_handler(Exception)
    async def unhandled_error_handler(request: Request, exc: Exception) -> JSONResponse:
        # Never expose internal exception details in production
        return error_response("internal_error", "An unexpected error occurred.", 500)
