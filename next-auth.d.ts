import { DefaultSession, DefaultUser } from "next-auth"
import { JWT, DefaultJWT } from "next-auth/jwt"

declare module "next-auth" {
    interface Session {
        user: {
            id: string,
            profile:any,
            role: any,
            roleId: string,
            name:string,
            image:string,
            email:string,
        } & DefaultSession
    }

    interface User extends DefaultUser {
        profile:any,
        role: any,
        roleId: string,
    }
}

declare module "next-auth/jwt" {
    interface JWT extends DefaultJWT {
        role: any,
        profile:any,
    }
}
