import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import LoadingScreen from './LoadingScreen';

export const PageTransition = ({ children }) => {
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const [content, setContent] = useState(children);

  useEffect(() => {
    const handleRouteChange = async () => {
      // Start loading
      setIsLoading(true);
      
      // Wait a minimum amount of time to show the loader (for better UX)
      await new Promise(resolve => setTimeout(resolve, 600));
      
      // Update content and stop loading
      setContent(children);
      setIsLoading(false);
    };
    
    handleRouteChange();
  }, [location.pathname, children]);

  return (
    <>
      {/* {isLoading && <LoadingScreen />}
      <div className={isLoading ? 'invisible' : 'visible'}> */}
        {content}
      {/* </div> */}
    </>
  );
};