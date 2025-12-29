import React from 'react';

const AllowancePage: React.FC = () => {
  return (
    <div className="page">
      <header className="hero">
        <div>
          <p className="eyebrow">Token Allowances</p>
          <h1>Manage Token Allowances</h1>
          <p className="lede">
            View and manage token allowances for your wallet. Grant permission to other addresses 
            to spend tokens on your behalf.
          </p>
        </div>
      </header>
    </div>
  );
};

export default AllowancePage;