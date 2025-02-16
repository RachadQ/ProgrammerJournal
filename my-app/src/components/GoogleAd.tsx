import React, { useEffect, useState, useRef } from 'react';

const GoogleAd: React.FC = () => {
  const [adKey, setAdKey] = useState(0); // Ensure re-renders have unique ad keys
  const adClient = process.env.REACT_APP_AD_CLIENT;
  const adSlot = process.env.REACT_APP_AD_SLOT;
  const adsInitializedRef = useRef(false); // Flag to track if ads have been initialized

 
  useEffect(() => {
    // Function to load Google Ads script
    const loadGoogleAdsScript = () => {
      if (!document.querySelector('script[src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js"]')) {
        const script = document.createElement('script');
        script.src = "https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js";
        script.async = true;
        script.onload = () => {
          console.log("Google Ads script loaded.");
          initializeAds();
        };
        document.body.appendChild(script);
      } else {
        console.log("Google Ads script already exists.");
        initializeAds();
      }
    };

    // Function to initialize ads
    const initializeAds = () => {
      if (window.adsbygoogle && Array.isArray(window.adsbygoogle) && !adsInitializedRef.current) {
        console.log("Initializing ads...");
        window.adsbygoogle.push({});
        adsInitializedRef.current = true;
      } else {
        console.log("Ads already initialized or script not loaded yet.");
      }
    };

    if (adClient && adSlot) {
      loadGoogleAdsScript();
    } else {
      console.error("Ad client or slot ID is missing.");
    }

    return () => {
      adsInitializedRef.current = false;
    };
  }, [adClient, adSlot]);

  const handleAdRender = () => {
    // Force re-render by updating the adKey to ensure a new ad is rendered
    setAdKey((prevKey) => prevKey + 1);
  };

  return (
    <div className="flex items-center justify-center ">
    <div 
    
      className="w-[1250px] h-[125px] p-3 m-1 border border-gray-200 rounded-md shadow-md"
      onClick={handleAdRender}
    >
      <ins
        key={adKey} // Ensure a unique key to force re-render in React
        style={{ display: 'block' }}
        data-ad-client={adClient}  // Pass your ad client ID here
        data-ad-slot={adSlot}      // Pass your ad slot ID here
        data-ad-format="auto"
        data-full-width-responsive="true"
        data-adtest="on"
        
      ></ins>
      </div>
    </div>
  );
  
};

export default GoogleAd;
