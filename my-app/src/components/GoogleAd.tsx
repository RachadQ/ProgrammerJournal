import React, { useEffect, useState, useRef } from 'react';

const GoogleAd: React.FC = () => {
  const [adKey, setAdKey] = useState(0); // Ensure re-renders have unique ad keys
  const adClient = process.env.REACT_APP_AD_CLIENT;
  const adSlot = process.env.REACT_APP_AD_SLOT;
  const adsInitializedRef = useRef(false); // Flag to track if ads have been initialized

  useEffect(() => {
    const loadAds = () => {
      // Check if ads have been initialized already to avoid double-pushing
      if (window.adsbygoogle && window.adsbygoogle.loaded && !adsInitializedRef.current) {
        console.log("Ads initialized successfully.");
        window.adsbygoogle.push({});
        adsInitializedRef.current = true; // Mark ads as initialized
      } else if (!window.adsbygoogle) {
        console.log("Google Ads script not loaded yet.");
      } else {
        console.log("Waiting for Google Ads script to load...");
        setTimeout(loadAds, 500); // Retry if the script is not loaded yet
      }
    };

    if (adClient && adSlot) {
      loadAds(); // Ensure ads are pushed after script is loaded
    } else {
      console.error('Ad client or slot ID is missing.');
    }

    // Cleanup the ref if necessary (optional)
    return () => {
      adsInitializedRef.current = false;
    };
  }, [adClient, adSlot]); // Re-run if adClient or adSlot changes

  const handleAdRender = () => {
    // Force re-render by updating the adKey to ensure a new ad is rendered
    setAdKey((prevKey) => prevKey + 1);
  };

  return (
    <div 
      className="w-22 h-8 p-2 m-4 border border-gray-200 rounded-md shadow-md"
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
  );
  
};

export default GoogleAd;
