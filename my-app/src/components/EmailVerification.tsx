import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import axios from "axios";

const EmailVerification: React.FC = () => {
  const [searchParams] = useSearchParams();
  const status  = searchParams.get("status");
  const [verificationStatus, setVerificationStatus] = useState<
    "loading" | "success" | "error"
  >("loading");

  useEffect(() => {
    if (status === "success") {
      setVerificationStatus("success");
    } else if (status === "error") {
      setVerificationStatus("error");
    } else {
      setVerificationStatus("loading");
    }
  }, [status]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-8">
        {verificationStatus === "loading" && (
          <div className="text-center">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <h2 className="text-lg font-semibold">Verifying your email...</h2>
          </div>
        )}
        {verificationStatus === "success" && (
          <div className="text-center text-green-500">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-10 w-10 mx-auto mb-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M9 12l2 2 4-4m0 0a9 9 0 11-5.478-8.59M12 18v.01"
              />
            </svg>
            <h2 className="text-lg font-semibold">Email Verified!</h2>
            <p className="text-gray-600 mt-2">
              Your email has been successfully verified. You can now log in.
            </p>
          </div>
        )}
        {verificationStatus === "error" && (
          <div className="text-center text-red-500">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-10 w-10 mx-auto mb-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 8v4m0 4h.01m-6.938 4h13.856C18.412 19.936 20 17.623 20 15V9c0-2.623-1.588-4.936-4.07-5.938m-9.86 11.876A3.993 3.993 0 016 9V6m0 12v-3m12 3v-3m0-6V6"
              />
            </svg>
            <h2 className="text-lg font-semibold">Verification Failed</h2>
            <p className="text-gray-600 mt-2">
              The token is invalid or has expired. Please request a new
              verification email.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmailVerification;