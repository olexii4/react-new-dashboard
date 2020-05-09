import axios from 'axios';

export const fetchDevfile = (url: string): Promise<string> => {
  return axios.get(url)
    .then(response => response.data)
    .catch(error => Promise.reject(new Error(error.response)));
};
