"use client";

import { Button } from "./ui/button";
import { BellIcon, HomeIcon, UserIcon } from "lucide-react";
import { SignInButton, UserButton } from "@clerk/nextjs";
import ModeToggle from "./ModeToggle";
import Link from "next/link";

interface UserData {
  id: string;
  username: string | null;
  email: string | undefined;
  imageUrl: string;
}

interface DesktopNavbarClientProps {
  user: UserData | null;
}

const DesktopNavbarClient = ({ user }: DesktopNavbarClientProps) => {
  return (
    <div className="hidden md:flex items-center space-x-4">
      <ModeToggle />

      <Button variant={"ghost"} className="flex items-center gap-2" asChild>
        <Link href="/">
          <HomeIcon className="w-4 h-4" />
          <span className="hidden lg:inline">Home</span>
        </Link>
      </Button>

      {user ? (
        <>
          <Button variant={"ghost"} className="flex items-center gap-2" asChild>
            <Link href="/notification">
              <BellIcon className="w-4 h-4" />
              <span className="hidden lg:inline">Notification</span>
            </Link>
          </Button>
          <Button variant={"ghost"} className="flex items-center gap-2" asChild>
            <Link href={`/profile/${user.username ?? user.email?.split("@")[0]}`}>
              <UserIcon className="w-4 h-4" />
              <span className="hidden lg:inline">Profile</span>
            </Link>
          </Button>
          <UserButton />
        </>
      ) : (
        <SignInButton mode="modal">
          <Button variant={"default"}>Sign In</Button>
        </SignInButton>
      )}
    </div>
  );
};

export default DesktopNavbarClient;
