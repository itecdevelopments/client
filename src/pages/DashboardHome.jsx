/* eslint-disable no-unused-vars */
"use client";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  UsersIcon,
  FolderIcon,
  Cog6ToothIcon,
  WrenchScrewdriverIcon,
  MapIcon,
} from "@heroicons/react/24/outline";

const pages = [
  { name: "Customers", href: "/dashboard/customers", icon: UsersIcon },
  { name: "Spare Parts", href: "/dashboard/spares", icon: FolderIcon },
  { name: "Regions", href: "/dashboard/regions", icon: MapIcon },
  { name: "Users", href: "/dashboard/users", icon: Cog6ToothIcon },
  {
    name: "Service Report",
    href: "/dashboard/service-report",
    icon: WrenchScrewdriverIcon,
  },
];

export default function DashboardHome() {
  const navigate = useNavigate();
  const username = localStorage.getItem("username");
  const role = localStorage.getItem("role");
  const regionName = localStorage.getItem("regionName");
  const regionCode = localStorage.getItem("regionCode");

  // ✅ Add this role-based filtering logic
  const visiblePages =
    role === "VXR" || role === "ADMIN"
      ? pages
      : pages.filter((p) => p.name !== "Regions" && p.name !== "Users");

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="flex items-center ml-4 my-2">
        <h1 className="text-gray-800 font-semibold text-lg">
          Welcome, {username || "User"} — {regionName || regionCode || "N/A"} (
          {role || "Role"})
        </h1>
      </div>

      <h1 className="text-3xl font-semibold text-gray-800 mb-8">
        Welcome to the Dashboard
      </h1>

      {/* Grid Container */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {visiblePages.map(
          (
            page,
            index // ✅ changed from pages.map()
          ) => (
            <motion.div
              key={page.name}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.4 }}
              onClick={() => navigate(page.href)}
              className="cursor-pointer bg-white rounded-2xl shadow-md hover:shadow-xl transition-all p-6 flex flex-col items-center justify-center text-center border border-gray-100"
            >
              <page.icon className="h-12 w-12 text-indigo-600 mb-3" />
              <h2 className="text-lg font-medium text-gray-800">{page.name}</h2>
              <p className="text-sm text-gray-500 mt-1">
                Manage {page.name.toLowerCase()}
              </p>
            </motion.div>
          )
        )}
      </div>
    </div>
  );
}
