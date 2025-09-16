// reCAPTCHA configuration
export const RECAPTCHA_CONFIG = {
  SITE_KEY: import.meta.env.VITE_RECAPTCHA_SITE_KEY || 'your-recaptcha-site-key-here',
  THEME: 'light',
  SIZE: 'normal'
};

export const getRecaptchaToken = (recaptchaRef) => {
  return new Promise((resolve, reject) => {
    if (!recaptchaRef.current) {
      reject(new Error('reCAPTCHA not loaded'));
      return;
    }
    
    const token = recaptchaRef.current.getValue();
    
    if (!token) {
      reject(new Error('Please complete the reCAPTCHA verification'));
      return;
    }
    
    resolve(token);
  });
};