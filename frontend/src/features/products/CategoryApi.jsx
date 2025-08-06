import { axiosi } from "../../config/axios";

export const fetchCategory = async (data) => {
    try {
        const res = await axiosi.get("/categories");
        return res.data;
    } catch (error) {
        throw error.response.data;
    }
}

export const addCategory = async (data) => {
    try {
        const res = await axiosi.post("/categories/create", data);
        return res.data;
    } catch (error) {
        throw error.response.data;
    }
}

