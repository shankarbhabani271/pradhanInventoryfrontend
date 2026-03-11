import axios from "axios";

export const loginUser = async(data:string)=>{
    const  res = await axios.post(
        "http://localhost:8080/api/auth/login",
        data,
        {
            withCredentials:true

        }
    )

    return res.data
}