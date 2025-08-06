import { axiosi } from "../../config/axios"

export const fetchAllCategories=async()=>{
    try {
        const res=await axiosi.get("/categories")
        return res.data
    } catch (error) {
        throw error.response.data
    }
}


export const addCategory = async (data) => {
    try {
        const res = await axiosi.post("/categories/create", data,{
            headers: {
                "Content-Type": "multipart/form-data"
            },
        });
        return res.data;
    } catch (error) {
        throw error.response.data || {message : "Failed to add category"};
    }
}

export const addSubcategory = async (data) => {
    try {
        const res = await axiosi.post("/categories/create-subcategory", data);
        return res.data;
    } catch (error) {
        throw error.response.data;
    }
}

export const deleteCategory = async (id) => {
    try {
        const res = await axiosi.delete(`/categories/categories/${id}`);
        return res.data;
    } catch (error) {
        throw error.response.data;
    }
}

export const deleteSubcategory = async (id) => {
    try {
        const res = await axiosi.delete(`/categories/subcategories/${id}`);
        return res.data;
    }   catch (error) {
        throw error.response.data;
    }
}
