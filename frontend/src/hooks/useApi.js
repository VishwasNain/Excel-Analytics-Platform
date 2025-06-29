import { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

const useApi = (url, method = 'GET', data = null) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios({
          method,
          url,
          data,
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        setResult(response.data);
      } catch (err) {
        setError(err.response?.data?.message || 'An error occurred');
        toast.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [url, method, data]);

  return { loading, error, result };
};

export default useApi;
