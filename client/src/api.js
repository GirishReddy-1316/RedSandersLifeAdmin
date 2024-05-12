import axios from 'axios';

const axiosInstance = axios.create({
    baseURL: `https://redsanderslifeserver.onrender.com/api`
});


export { axiosInstance };
