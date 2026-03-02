import React from "react";

const Footer: React.FC = () => {
  return (
    <footer className="bg-bcp-blue bg-opacity-100 w-full flex items-center justify-between p-6 mt-auto">
      <div>
        <a
          href="https://www.bostoncommunitypediatrics.org/donate"
          className="bg-light-bcp-blue text-white text-sm px-4 py-3 rounded text-center"
        >
          Donate to BCP
        </a>
      </div>
      <div className="text-xs text-white text-right">
        <p>
          Boston Community Pediatrics (BCP) is a nonprofit organization, Tax ID
          84-3091463.
        </p>
        <p>© 2025 Boston Community Pediatrics</p>
      </div>
    </footer>
  );
};

export default Footer;
