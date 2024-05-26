import axios from 'axios';

const axiosInstance = axios.create({
    baseURL: `https://api.jiyaba.com/api`
});


export { axiosInstance };
