import React, { ReactNode } from 'react';
import Header from './Header';
import Footer from './Footer';
import children from "../../types/BaseLayout.interface"
const BaseLayout: React.FC<children> = ({children }) => {

  
    return (
      <div>
        <Header />
        <main>{children}</main>
        <Footer />
      </div>
    );
  };
  
  export default BaseLayout;