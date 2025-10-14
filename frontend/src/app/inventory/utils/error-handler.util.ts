/**
 * Centralized error handling utility for inventory module
 * Extracts user-friendly error messages from HTTP error responses
 */
export class ErrorHandler {
  /**
   * Extracts a user-friendly error message from various error formats
   */
  static extractMessage(error: any): string {
    // Connection errors
    if (error.status === 0) {
      return 'Unable to connect to server. Please check if the backend is running.';
    }

    // Plain text responses
    if (typeof error.error === 'string' && error.error.trim()) {
      return error.error;
    }

    // Structured JSON responses
    if (error.error && typeof error.error === 'object') {
      if (error.error.error) return error.error.error;
      if (error.error.message) return error.error.message;
      if (error.error.errors && Array.isArray(error.error.errors)) {
        return error.error.errors.join(', ');
      }
    }

    // Fallback to error.message
    if (error.message) {
      return error.message;
    }

    // HTTP status code defaults
    return this.getDefaultMessageForStatus(error.status);
  }

  /**
   * Returns default error message for common HTTP status codes
   */
  private static getDefaultMessageForStatus(status: number): string {
    switch (status) {
      case 400:
        return 'Invalid request. Please check your input.';
      case 409:
        return 'This item already exists. Please use different values.';
      case 500:
        return 'Server error occurred. Please try again later.';
      default:
        return 'An unexpected error occurred. Please try again.';
    }
  }
}
