"use server";

import prisma from "@/lib/prisma";
import { auth, currentUser } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
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
  if (!clerkId) return null;

  const user = await getUserByClerkId(clerkId);

  if (!user) throw new Error("User not found");

  return user.id;
}

export async function getRandomUser() {
  try {
    const userId = await getDbUserId();

    if(!userId) return [];

    const randomUser = await prisma.user.findMany({
      where: {
        AND: [
          {NOT: {id: userId}},
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

export async function toggleFollow(targetUserId: string) {
  try {
    const userId = await getDbUserId(); //my id

    if(!userId) return;

    if(userId === targetUserId) throw new Error("You cannot follow yourself");

    const existingFollow = await prisma.follows.findUnique({
      where: {
        followerId_followingId: {
          followerId: userId,
          followingId: targetUserId
        }
      }
    })

    if(existingFollow) {
      //unfollow
      await prisma.follows.delete({
        where: {
          followerId_followingId: {
            followerId: userId,
            followingId: targetUserId
          }
        }
      })
    } else {
      //follow
      await prisma.$transaction([
        prisma.follows.create({
          data: {
            followerId: userId,
            followingId: targetUserId
          }
        }),

        prisma.notification.create({
          data: {
            type: "FOLLOW",
            userId: targetUserId, //user being followed
            creatorId: userId //user following
          }
        })
      ])
    }
    revalidatePath('/');
    return {success: true};
  } catch (error) {
    console.log("Error in toggleFollow", error);
    return {success: false};
  }
}

export async function createCommnet(postId: string, content: string) {
  try {
    const userId = await getDbUserId();

    if(!useId) return;
    if(!content) throw new Error("Content is required");

    const post = await prisma.post.findUnique({
      where: {id: postId},
      select: {authorId: true},
    })

    if(!post) throw new Error("Post not found");

    //Create comment and notification is a transaction
    const [comment] = await prisma.$transaction(async(tx) => {
      //Create commnet first
      const newCommnet = await tx.comment.create({
        data: {
          content,
          authorId: userId as string,
          postId,
        },
      });

      //create notification if comenting on someone else's post
      if(post.authorId !== userId) {
        await tx.notification.create({
          data: {
            type: "COMMENT",
            userId: post.authorId,
            creatorId: userId as string,
            postId,
            commentId: newCommnet.id
          }
        })
      }

      return [newCommnet];
    });

    revalidatePath(`/`);
    return { success: true, comment}; 
  } catch (error) {
    console.error("Failed to create comment:", error);
    return { success: false, error: "Failed to create comment"};
  }
}

export async function deletePost(postId: string) {
  try {
    const userId = await getDbUserId();

    const post = await prisma.post.findUnique({
      where: { id: postId },
      select: { authorId: true },
    });

    if(!post) throw new Error("Post not Found");
    if(post.authorId !== userId) throw new Error("Unauthorized - no delete permission");

    await prisma.post.delete({
      where: { id: postId },
    })

    revalidatePath("/") //purge the cache
    return { success: true };
  } catch (error) {
    console.error("Failed to delete post:", error);
    return { success: false, error: "Failed to delete post"};
  }
}
