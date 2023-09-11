import axios from 'axios';
import httpStatus from 'http-status';

const getService = (baseURL) =>
  axios.create({
    baseURL,
    validateStatus: (status) => status < httpStatus.INTERNAL_SERVER_ERROR,
    withCredentials: true,
  });

export default getService;
