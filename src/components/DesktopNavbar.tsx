import { currentUser } from "@clerk/nextjs/server";
import DesktopNavbarClient from "./DesktopNavbarClient";

const DesktopNavbar = async () => {
  const user = await currentUser();

  const safeUser = user
    ? {
        id: user.id,
        username: user.username,
        email: user.emailAddresses[0]?.emailAddress,
        imageUrl: user.imageUrl,
      }
    : null;

  return <DesktopNavbarClient user={safeUser} />;
};

export default DesktopNavbar;
