"use client";

import { NAVBAR_HEIGHT } from "@/lib/constants";
import Image from "next/image";
import Link from "next/link";
import React from "react";
import { Button } from "./ui/button";
import { useGetAuthUserQuery } from "@/state/api";
import { usePathname, useRouter } from "next/navigation";
import { signOut } from "aws-amplify/auth";
import { Bell, MessageCircle, Plus, Search } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { SidebarTrigger } from "./ui/sidebar";
import { useTranslations } from "@/lib/i18n-client";

const Navbar = () => {
  const { data: authUser } = useGetAuthUserQuery();

  const router = useRouter();
  const pathname = usePathname();
  const { t } = useTranslations();

  const isDashboardPage =
    pathname.includes("/managers") || pathname.includes("/tenants");

  const handleSignOut = async () => {
    await signOut();
    window.location.href = "/";
  };

  return (
    <div
      className="fixed top-0 left-0 w-full z-50 shadow-xl"
      style={{ height: `${NAVBAR_HEIGHT}px` }}
    >
      <div className="flex justify-between items-center w-full py-3 px-8">
        <div className="flex items-center gap-4 md:gap-6">
          {isDashboardPage && (
            <div className="md:hidden">
              <SidebarTrigger />
            </div>
          )}
          <Link
            href="/"
            className="cursor-pointer hover:!text-primary-300"
            scroll={false}
          >
            <div className="flex items-center">
              <span className=" font-bold text-2xl ">
                <span className="text-4xl text-blue-700 font-bold">M</span>
                adagou
              </span>
            </div>
          </Link>
          {isDashboardPage && authUser && (
            <Button
              variant="secondary"
              className="md:ml-4 bg-blue-700 text-white  hover:text-primary-50"
              onClick={() =>
                router.push(
                  authUser.userRole?.toLowerCase() === "manager"
                    ? "/managers/newproperty"
                    : "/search",
                )
              }
            >
              {authUser.userRole?.toLowerCase() === "manager" ? (
                <>
                  <Plus className="h-4 w-4" />
                  <span className="hidden md:block ml-2">
                    {t("navbar.addNewProperty")}
                  </span>
                </>
              ) : (
                <>
                  <Search className="h-4 w-4" />
                  <span className="hidden  ml-2">
                    {t("navbar.searchProperties")}
                  </span>
                </>
              )}
            </Button>
          )}
        </div>
        {!isDashboardPage && (
          <p className="text-primary-200 hidden md:block">
            {t("navbar.discoverTagline")}
          </p>
        )}
        <div className="flex items-center gap-5">
          {authUser ? (
            <>
              <DropdownMenu>
                <DropdownMenuTrigger className="flex items-center gap-2 focus:outline-none">
                  <Avatar>
                    <AvatarImage src={authUser.userInfo?.image} />
                    <AvatarFallback className="bg-primary-600">
                      {authUser.userRole?.[0].toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <p className=" hidden md:block">{authUser.userInfo?.name}</p>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="bg-white ">
                  <DropdownMenuItem
                    className="cursor-pointer  font-bold"
                    onClick={() =>
                      router.push(
                        authUser.userRole?.toLowerCase() === "manager"
                          ? "/managers/properties"
                          : "/tenants/favorites",
                        { scroll: false },
                      )
                    }
                  >
                    {t("navbar.goToDashboard")}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-primary-200" />
                  <DropdownMenuItem
                    className="cursor-pointer  "
                    onClick={() =>
                      router.push(
                        `/${authUser.userRole?.toLowerCase()}s/settings`,
                        { scroll: false },
                      )
                    }
                  >
                    {t("common.settings")}
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="cursor-pointer "
                    onClick={handleSignOut}
                  >
                    {t("common.signOut")}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <>
              <Link href="/signin">
                <Button
                  variant="outline"
                  className="text-white border-white bg-transparent hover:bg-white  rounded-lg"
                >
                  {t("common.signIn")}
                </Button>
              </Link>
              <Link href="/signup">
                <Button
                  variant="secondary"
                  className="text-white bg-secondary-600 hover:bg-white rounded-lg"
                >
                  {t("common.signUp")}
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Navbar;
