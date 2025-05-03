"use server";

import prisma from "@/lib/prisma";
import { auth, currentUser } from "@clerk/nextjs/server";
import { useId } from "react";

export async function syncUser() {
  try {
    const { userId } = await auth();
    const user = await currentUser();

    const existingUser = await prisma.user.findUnique({
      where: {
        clerkId: userId as string,
      },
    });

    if (existingUser) return existingUser;

    if (!useId || !user) return;

    const dbUser = await prisma.user.create({
      data: {
        clerkId: userId as string,
        name: `${user.firstName || ""} ${user.lastName || ""}`,
        username:
          user.username ?? user.emailAddresses[0].emailAddress.split("@")[0],
        email: user.emailAddresses[0].emailAddress,
        image: user.imageUrl,
      },
    });

    return dbUser;
  } catch (error) {
    console.log("Error in SyncUser:", error);
  }
}

export async function getUserByClerkId(clerkId: string) {
  return prisma.user.findUnique({
    where: {
      clerkId,
    },
    include: {
      _count: {
        select: {
          followers: true,
          following: true,
          posts: true,
        },
      },
    },
  });
}

export async function getDbUserId() {
  const { userId: clerkId } = await auth();
  if (!clerkId) throw new Error("Unauthorized");

  const user = await getUserByClerkId(clerkId);

  if (!user) throw new Error("User not found");

  return user.id;
}

export async function getRandomUser() {
  try {
    const userId = await getDbUserId();

    const randomUser = await prisma.user.findMany({
      where: {
        AND: [
          
          {
            NOT: {
              followers: {
                some: {
                  followerId: userId,
                },
              },
            },
          },
        ],
      },
      select: {
        id: true,
        name: true,
        username: true,
        image: true,
        _count: {
          select: {
            followers: true
          }
        }
      },
      take: 3
    });

    return randomUser;
  } catch (error) {
    console.error("Error fetching random users", error);
    return [];
  }
}
