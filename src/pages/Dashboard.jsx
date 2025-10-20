"use client";
import { useState } from "react";
import { getUserRole } from "../api/auth";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogBackdrop,
  DialogPanel,
  TransitionChild,
} from "@headlessui/react";
import {
  Bars3Icon,
  Cog6ToothIcon,
  FolderIcon,
  HomeIcon,
  UsersIcon,
  XMarkIcon,
  WrenchScrewdriverIcon,
} from "@heroicons/react/24/outline";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: HomeIcon },
  { name: "Customers", href: "/dashboard/customers", icon: UsersIcon },
  { name: "Spare Parts", href: "/dashboard/spares", icon: FolderIcon },
  { name: "Regions", href: "/dashboard/regions", icon: FolderIcon }, // ✅ add this line
  { name: "Users", href: "/dashboard/users", icon: UsersIcon },
  {
    name: "Service Report",
    href: "/dashboard/service-report",
    icon: WrenchScrewdriverIcon,
  },
  {
    name: "Service Reports",
    href: "/dashboard/service-reports",
    icon: WrenchScrewdriverIcon,
  },
];

// const userNavigation = [
//   { name: "Your profile", href: "#" },
//   { name: "Sign out", href: "#" },
// ];

function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

export default function Dashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const role = getUserRole();
  let filteredNavigation = navigation;

  if (role === "ENG" || role === "BM" || role === "CM") {
    filteredNavigation = navigation.filter(
      (item) =>
        item.name === "Service Report" || item.name === "Service Reports"
    );
  } else if (role === "VXR") {
    filteredNavigation = navigation;
  } else {
    filteredNavigation = navigation.filter((item) => item.name === "Dashboard");
  }

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  return (
    <div>
      {/* Mobile Sidebar */}
      <Dialog
        open={sidebarOpen}
        onClose={setSidebarOpen}
        className="relative z-50 lg:hidden"
      >
        <DialogBackdrop
          transition
          className="fixed inset-0 bg-gray-900/80 transition-opacity duration-300 ease-linear data-closed:opacity-0"
        />
        <div className="fixed inset-0 flex">
          <DialogPanel
            transition
            className="relative mr-16 flex w-full max-w-xs flex-1 transform transition duration-300 ease-in-out data-closed:-translate-x-full"
          >
            <TransitionChild>
              <div className="absolute top-0 left-full flex w-16 justify-center pt-5 duration-300 ease-in-out data-closed:opacity-0">
                <button
                  type="button"
                  onClick={() => setSidebarOpen(false)}
                  className="-m-2.5 p-2.5"
                >
                  <span className="sr-only">Close sidebar</span>
                  <XMarkIcon aria-hidden="true" className="size-6 text-white" />
                </button>
              </div>
            </TransitionChild>

            <div className="relative flex grow flex-col gap-y-5 overflow-y-auto bg-white px-6 pb-4">
              <div className="flex h-16 shrink-0 items-center">
                <img
                  alt="ITEC"
                  src="/images/iteclogo.png"
                  className="h-8 w-auto"
                />
              </div>
              <nav className="flex flex-1 flex-col">
                <ul role="list" className="flex flex-1 flex-col gap-y-7">
                  <li>
                    <ul role="list" className="-mx-2 space-y-1">
                      {filteredNavigation.map((item) => (
                        <li key={item.name}>
                          <Link
                            to={item.href}
                            onClick={() => setSidebarOpen(false)}
                            className={classNames(
                              location.pathname === item.href
                                ? "bg-gray-50 text-indigo-600"
                                : "text-gray-700 hover:bg-gray-50 hover:text-indigo-600",
                              "group flex gap-x-3 rounded-md p-2 text-sm/6 font-semibold"
                            )}
                          >
                            <item.icon
                              aria-hidden="true"
                              className={classNames(
                                location.pathname === item.href
                                  ? "text-indigo-600"
                                  : "text-gray-400 group-hover:text-indigo-600",
                                "size-6 shrink-0"
                              )}
                            />
                            {item.name}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </li>
                  <li className="mt-auto">
                    <button
                      onClick={handleLogout}
                      className="w-full text-left group -mx-2 flex gap-x-3 rounded-md p-2 text-sm/6 font-semibold text-red-600 hover:bg-gray-50 hover:text-red-700"
                    >
                      <Cog6ToothIcon
                        aria-hidden="true"
                        className="size-6 shrink-0 text-gray-400 group-hover:text-red-600"
                      />
                      Logout
                    </button>
                  </li>
                </ul>
              </nav>
            </div>
          </DialogPanel>
        </div>
      </Dialog>

      {/* Desktop Sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-72 lg:flex-col">
        <div className="flex grow flex-col gap-y-5 overflow-y-auto border-r border-gray-200 bg-white px-6 pb-4">
          <div className="flex h-16 shrink-0 items-center">
            <img
              alt="Your Company"
              src="/images/iteclogo.png"
              className="h-8 w-auto"
            />
          </div>
          <nav className="flex flex-1 flex-col">
            <ul role="list" className="flex flex-1 flex-col gap-y-7">
              <li>
                <ul role="list" className="-mx-2 space-y-1">
                  {filteredNavigation.map((item) => (
                    <li key={item.name}>
                      <Link
                        to={item.href}
                        className={classNames(
                          location.pathname === item.href
                            ? "bg-gray-50 text-indigo-600"
                            : "text-gray-700 hover:bg-gray-50 hover:text-indigo-600",
                          "group flex gap-x-3 rounded-md p-2 text-sm/6 font-semibold"
                        )}
                      >
                        <item.icon
                          aria-hidden="true"
                          className={classNames(
                            location.pathname === item.href
                              ? "text-indigo-600"
                              : "text-gray-400 group-hover:text-indigo-600",
                            "size-6 shrink-0"
                          )}
                        />
                        {item.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </li>

              <li className="mt-auto">
                <button
                  onClick={handleLogout}
                  className="w-full text-left group -mx-2 flex gap-x-3 rounded-md p-2 text-sm/6 font-semibold text-red-600 hover:bg-gray-50 hover:text-red-700"
                >
                  <Cog6ToothIcon
                    aria-hidden="true"
                    className="size-6 shrink-0 text-gray-400 group-hover:text-red-600"
                  />
                  Logout
                </button>
              </li>
            </ul>
          </nav>
        </div>
      </div>

      {/* Top Bar */}
      <div className="lg:pl-72">
        <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-gray-200 bg-white px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            className="-m-2.5 p-2.5 text-gray-700 hover:text-gray-900 lg:hidden"
          >
            <span className="sr-only">Open sidebar</span>
            <Bars3Icon aria-hidden="true" className="size-6" />
          </button>
        </div>
        {/* Main Content (Dynamic Outlet) */}
        {/* Main Content */}
        <main className="py-10 px-4 sm:px-6 lg:px-8 bg-gray-50 min-h-screen">
          {/* 🟦 Persistent Welcome Header */}
          <div className="bg-white shadow-sm rounded-xl mb-6 p-4 border border-gray-200">
            <h2 className="text-lg font-semibold text-gray-800">
              Welcome,{" "}
              <span className="text-indigo-600">
                {localStorage.getItem("username") || "User"}
              </span>{" "}
              —
              <span className="ml-1">
                {localStorage.getItem("role") || "Role"}
              </span>
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Region:{" "}
              <span className="font-medium text-gray-700">
                {localStorage.getItem("regionName") || "N/A"}
              </span>
            </p>
            <p className="text-sm text-gray-500">Welcome to the Dashboard!</p>
          </div>

          {/* Actual Page Content */}
          <Outlet />
        </main>
      </div>
    </div>
  );
}
