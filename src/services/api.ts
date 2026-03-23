import axios from "axios";
import {store} from "@/store/store";

export const api = axios.create({
    baseURL: "http://localhost:8080/api",

});


api.interceptors.request.use((config) => {
    const token = store.getState().auth.token;
        if(token){
            config.headers.Authorization = `bearer ${token}`;

        }

        return config;

    
});
export default api;