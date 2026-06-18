import { AppProps } from 'next/app';
import Router from 'next/router';
import axios from 'axios';
import '../styles/globals.css';

// Global Axios Interceptor to handle expired tokens (401 Unauthorized)
if (typeof window !== 'undefined') {
  axios.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response && error.response.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        Router.push('/login');
      }
      return Promise.reject(error);
    }
  );
}

function MyApp({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />;
}

export default MyApp;