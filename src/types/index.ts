export interface User {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
}

export interface ErrorResponse {
  error: string;
  message: string;
}