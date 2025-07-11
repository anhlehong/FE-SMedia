"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import UserAvatar from "../components/UserAvatar";
import {
  HomeIcon,
  UsersIcon,
  UserGroupIcon,
} from "@heroicons/react/24/outline";
import { usePathname } from "next/navigation";

export default function NavBar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const navigationLinks = [
    {
      label: "Trang chủ",
      link: "home",
      icon: <HomeIcon className="h-5 w-5 mr-2" />,
    },
    {
      label: "Bạn bè",
      link: "friends",
      icon: <UsersIcon className="h-5 w-5 mr-2" />,
    },
    {
      label: "Nhóm",
      link: "groups",
      icon: <UserGroupIcon className="h-5 w-5 mr-2" />,
    },
  ];

  return (
    <nav
      className={`fixed w-full z-50 top-0 left-0 transition-all duration-500 ease-in-out ${"bg-gradient-to-r from-blue-400 to-indigo-700 dark:from-gray-800 dark:to-gray-900"}`}
    >
      <div className="max-w-screen flex items-center justify-between mx-auto px-4 py-2">
        {/* Logo */}
        <Link href="/home" className="flex items-center space-x-3 group">
          <div className="overflow-hidden rounded-lg h-10 w-10 bg-white p-1 shadow-md transition-transform duration-300 group-hover:scale-110">
            <Image src="/hcmueLogo.png" width={36} height={36} alt="Logo" />
          </div>
          <div className="flex flex-col">
            <span className="text-xl text-blue-200 dark:text-gray-300 font-bold tracking-tight transition-colors duration-300 group-hover:text-blue-300">
              HCMUE
            </span>
            <span
              className={`text-xs font-medium -mt-1 ${"text-blue-200 dark:text-gray-300 group-hover:text-blue-300"}`}
            >
              Mạng xã hội sinh viên
            </span>
          </div>
        </Link>

        {/* Navigation */}
        <div className="hidden md:flex space-x-8 text-white dark:text-blue-100">
          {navigationLinks.map((item) => {
            const isActive = pathname === `/${item.link}`; // Kiểm tra nếu đường dẫn trùng

            return (
              <Link
                key={item.link}
                href={`/${item.link}`}
                className={`relative font-medium w-28 justify-center flex h-full py-4 rounded-md transition-colors group 
                    ${
                      isActive
                        ? "bg-blue-100/40  dark:bg-gray-500"
                        : "hover:bg-blue-100/40 dark:hover:bg-gray-500"
                    }
                `}
                title={item.label}
              >
                {item.icon}
                {/* Hiển thị thanh underline nếu đang ở trang hiện tại */}
                {/* {isActive && (
                  <span className="absolute -bottom-1 left-0 w-full h-[2px] bg-blue-500 transition-all"></span>
                )} */}
              </Link>
            );
          })}
        </div>

        {/* User & Menu */}
        <div className="flex items-center space-x-4">
          <UserAvatar />
          <button
            onClick={toggleMobileMenu}
            className="md:hidden p-2 rounded-lg transition-all duration-300 ease-in-out"
          >
            <svg
              className={`w-6 h-6 transform transition-transform duration-500 ${
                mobileMenuOpen ? "rotate-90" : ""
              }`}
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d={
                  mobileMenuOpen
                    ? "M6 18L18 6M6 6l12 12"
                    : "M4 6h16M4 12h16M4 18h16"
                }
              />
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        <div
          className={`w-full md:hidden ${mobileMenuOpen ? "block" : "hidden"}`}
        >
          <div className="mt-3 rounded-lg shadow-lg bg-white dark:bg-gray-800">
            {navigationLinks.map((item) => (
              <Link
                key={item.link}
                href={`/${item.link}`}
                className="block px-4 py-3 text-base font-medium border-b transition-all duration-300 hover:bg-blue-100 dark:hover:bg-gray-700"
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
}
