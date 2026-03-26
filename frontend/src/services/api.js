import axios from "axios";

const API = axios.create({
  baseURL: "https://digitalheroes-bkdq.onrender.com/"
});

export default API;
