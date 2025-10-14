import { PrismaClient as prisma } from "@prisma/client/edge";

export async function getUsers(){
    try{
        const users = await prisma.user.findMany(); 
        return users; 
    }catch(error){
        throw new Error("Failed to fetch users"); 
    }
}

export async function getUserById(id: string){
    try{
        const user = await prisma.user.findUnique({
            where:{
                id: id,
            },
        }); 
    }catch(error){
        throw new Error("Failed to fetch user"); 
    }
}

// export async function createUser(first: string, last: string, int: ph){
    
// }