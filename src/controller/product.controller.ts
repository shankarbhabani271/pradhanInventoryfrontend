import { apiCaller } from "@/config/http";

export type Tproduct ={
    id:string;
    name:string;
    category:string;
    price:number;
}

export const getProducts=async ()=>{
  return await apiCaller<Tproduct[]>({
        url:"/products",
        method:"GET",
    });

}
    