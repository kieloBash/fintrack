import { api } from "@/lib/axios";

export async function createUserAfterSignIn() {
    try {
        const res = await api.post("/user/create", {})
        return res.data;
    } catch (error) {
        console.error(error)
        throw new Error("An error occured at: createUserAfterSignIn")
    }
}