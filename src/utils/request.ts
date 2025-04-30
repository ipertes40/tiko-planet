import axios from "axios";

const instance = axios.create({
  baseURL: "http://localhost:3000",
  timeout: 5000,
});

// 响应拦截器，自动提取 res.data
instance.interceptors.response.use(
  (response) => {
    // 自动解构并返回内部的 data 对象
    const res = response.data;
    return res
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default instance;
