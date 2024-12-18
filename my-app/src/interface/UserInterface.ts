// SignUpFormInterface.ts

export {};
export interface SignUpForm {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    confirmPassword: string; // Temporary field for confirmPassword
    profilePicture?: string;
    username: string;
  }