import { UserProfileDTO } from "@/dto/user-profile.dto";
import { api } from "@/lib/axios";

export const UserService = {
    async createUserAfterSignIn() {
        try {
            const res = await api.post("/user/create", {})
            return res.data;
        } catch (error) {
            console.error(error)
            throw new Error("An error occured at: createUserAfterSignIn")
        }
    },
    async getUserSettingsProfile(): Promise<UserProfileDTO> {
        try {
            const res = await api.get("/user/profile")
            return res.data;
        } catch (error) {
            console.error(error)
            throw new Error("An error occured at: getUserSettingsProfile")
        }
    }
}