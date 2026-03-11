import { PrismaClient } from '@prisma/client';
import { getSession } from './auth';

const prismaClientSingleton = () => {
  return new PrismaClient();
};

const prismaExtended = (client: ReturnType<typeof prismaClientSingleton>) => {
  return client.$extends({
    query: {
      $allModels: {
        async $allOperations({ model, operation, args, query }) {
          let session = null;
          try {
            session = await getSession();
          } catch (e) {}

          const userId = session?.userId;
          const role = session?.role;

          if (userId) {
            // Use basePrisma to start a transaction that doesn't trigger this extension again
            return basePrisma.$transaction(async (tx) => {
              await tx.$executeRawUnsafe(`SET LOCAL app.current_user_id = '${userId}'`);
              if (role) {
                await tx.$executeRawUnsafe(`SET LOCAL app.current_user_role = '${role}'`);
              }
              // Execute the operation on the non-extended transaction client
              const modelClient = (tx as any)[model];
              if (modelClient && modelClient[operation]) {
                 return modelClient[operation](args);
              }
              return query(args); // Fallback
            });
          }

          return query(args);
        },
      },
    },
  });
};

type PrismaClientSingleton = ReturnType<typeof prismaClientSingleton>;

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClientSingleton | undefined;
};

const basePrisma = globalForPrisma.prisma ?? prismaClientSingleton();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = basePrisma;

export const prisma = prismaExtended(basePrisma);
export default prisma;
