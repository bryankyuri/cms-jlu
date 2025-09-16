import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export const ScrollToTop = ({ children }) => {
  const location = useLocation();
  
  useEffect(() => {
    // Scroll to top when pathname changes (navigation)
    window.scrollTo({
      top: 0,
      left: 0,
    });
  }, [location.pathname]);

  // Add a separate effect to handle page refreshes
  useEffect(() => {
    // This runs once when component mounts (page loads or refreshes)
    window.scrollTo({
      top: 0,
      left: 0,
    });
    
    // Add event listener for beforeunload to reset scroll position
    const handleBeforeUnload = () => {
      if ('scrollRestoration' in history) {
        // Prevent the browser from restoring scroll position on refresh
        history.scrollRestoration = 'manual';
      }
    };
    
    // Apply the setting immediately
    if ('scrollRestoration' in history) {
      history.scrollRestoration = 'manual';
    }

    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  return children;
};