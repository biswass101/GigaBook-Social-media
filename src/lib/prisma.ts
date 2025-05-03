import { PrismaClient} from "@prisma/client"

const PrismaClientSingleton = () => {
    return new PrismaClient();
}

declare const globalThis: {
    pirsmaGlobal: ReturnType<typeof PrismaClientSingleton>;
} & typeof global

const prisma = globalThis.pirsmaGlobal ?? PrismaClientSingleton();

export default prisma;

if(process.env.NODE_ENV !== 'production') globalThis.pirsmaGlobal = prisma;