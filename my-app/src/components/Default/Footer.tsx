import React from "react";

const Footer: React.FC<{}>  = () => {
    return (
      <footer className="bg-gray-800 text-gray-300 py-6">
      <div className="container mx-auto text-center">
        {/* Company Name */}
        <p className="text-sm">&copy; {new Date().getFullYear()} Plog. All Rights Reserved.</p>

        {/* Footer Links */}
        <div className="mt-4">
          <a href="/about" className="text-gray-400 hover:text-white mx-2">
            About Us
          </a>
          <a href="/contact" className="text-gray-400 hover:text-white mx-2">
            Contact
          </a>
          <a href="/privacy-policy" className="text-gray-400 hover:text-white mx-2">
            Privacy Policy
          </a>
          <a href="/terms-of-service" className="text-gray-400 hover:text-white mx-2">
            Terms of Service
          </a>
        </div>
      </div>
    </footer>
      );
};

export default Footer;