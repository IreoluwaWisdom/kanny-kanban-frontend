/**
 * Converts technical error messages to user-friendly messages
 */
export function getUserFriendlyError(error: string | Error | unknown): string {
  const errorMessage = error instanceof Error ? error.message : String(error);

  // Network errors
  if (errorMessage.includes('Failed to fetch') || errorMessage.includes('NetworkError')) {
    return 'Unable to connect to the server. Please check your internet connection and try again.';
  }

  if (errorMessage.includes('Cannot connect to server')) {
    return 'Unable to connect to the server. Please make sure the service is running and try again.';
  }

  // Authentication errors
  if (errorMessage.includes('Invalid email or password') || errorMessage.includes('Invalid credentials')) {
    return 'The email or password you entered is incorrect. Please try again.';
  }

  if (errorMessage.includes('User with this email already exists')) {
    return 'An account with this email already exists. Please sign in instead.';
  }

  if (errorMessage.includes('Token expired') || errorMessage.includes('expired')) {
    return 'Your session has expired. Please sign in again.';
  }

  if (errorMessage.includes('Not authenticated') || errorMessage.includes('Unauthorized')) {
    return 'Please sign in to continue.';
  }

  // Firebase/Google auth errors
  if (errorMessage.includes('Firebase') || errorMessage.includes('Google')) {
    if (errorMessage.includes('popup') || errorMessage.includes('cancelled')) {
      return 'Sign in was cancelled. Please try again.';
    }
    if (errorMessage.includes('network')) {
      return 'Network error during sign in. Please check your connection and try again.';
    }
    return 'Unable to sign in with Google. Please try again or use email and password.';
  }

  // Board/Column/Card errors
  if (errorMessage.includes('Board not found')) {
    return 'The board you\'re looking for could not be found.';
  }

  if (errorMessage.includes('Column not found')) {
    return 'The column could not be found.';
  }

  if (errorMessage.includes('Card not found')) {
    return 'The card could not be found.';
  }

  if (errorMessage.includes('Failed to load board')) {
    return 'Unable to load your board. Please refresh the page and try again.';
  }

  if (errorMessage.includes('Failed to load boards')) {
    return 'Unable to load boards. Please refresh the page and try again.';
  }

  // Validation errors
  if (errorMessage.includes('required') || errorMessage.includes('missing')) {
    return 'Please fill in all required fields.';
  }

  if (errorMessage.includes('invalid') || errorMessage.includes('Invalid')) {
    return 'The information you entered is invalid. Please check and try again.';
  }

  // Server errors
  if (errorMessage.includes('500') || errorMessage.includes('Internal server error')) {
    return 'Something went wrong on our end. Please try again in a moment.';
  }

  if (errorMessage.includes('404') || errorMessage.includes('not found')) {
    return 'The requested resource could not be found.';
  }

  if (errorMessage.includes('403') || errorMessage.includes('Forbidden')) {
    return 'You don\'t have permission to perform this action.';
  }

  // Generic fallbacks
  if (errorMessage.includes('failed') || errorMessage.includes('error')) {
    return 'Something went wrong. Please try again.';
  }

  // If it's already user-friendly, return as is
  if (errorMessage.length < 100 && !errorMessage.includes('Error:') && !errorMessage.includes('at ')) {
    return errorMessage;
  }

  // Default fallback
  return 'An unexpected error occurred. Please try again or contact support if the problem persists.';
}

