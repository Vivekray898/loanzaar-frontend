"use client"

import React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Home,
  Briefcase,
  PlusCircle,
  Shield,
  User
} from "lucide-react"

export default function BottomNav({ items } = {}) {
  const pathname = usePathname() || "/"

  const navItems = items || [
    { key: "home", label: "Home", path: "/", icon: Home },
    { key: "loans", label: "Loans", path: "/loans", icon: Briefcase },

    // 🔥 Primary Action
    { key: "apply", label: "Apply", path: "/apply", icon: PlusCircle, primary: true },

    { key: "insurance", label: "Insurance", path: "/insurance", icon: Shield },
    { key: "profile", label: "Profile", path: "/account", icon: User },
  ]

  const isActive = (path) =>
    path === "/" ? pathname === "/" : pathname.startsWith(path)

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white shadow-lg pb-[env(safe-area-inset-bottom)]">
      <div className="flex items-stretch justify-between h-[64px]">
        {navItems.map((item) => {
          const active = isActive(item.path)
          const Icon = item.icon

          // 🌟 Primary Apply Button
          if (item.primary) {
            return (
              <Link
                key={item.key}
                href={item.path}
                className="relative -mt-6 flex-1 flex items-center justify-center"
              >
                <div className="w-14 h-14 rounded-full bg-black text-white flex items-center justify-center shadow-lg">
                  <Icon className="w-7 h-7" strokeWidth={2} />
                </div>
              </Link>
            )
          }

          return (
            <Link
              key={item.key}
              href={item.path}
              className="group relative flex-1 flex flex-col items-center justify-center focus:outline-none"
            >
              {/* Active Top Line Indicator */}
              <span
                className={`
                  absolute top-0 left-1/2 -translate-x-1/2 h-[3px] w-10 rounded-b-lg transition-colors duration-300
                  ${active ? "bg-black" : "bg-transparent"}
                `}
              />

              <Icon
                className={`
                  w-6 h-6 mb-1 transition-all duration-300
                  ${active
                    ? "text-black -translate-y-1"
                    : "text-gray-400 group-hover:text-gray-600"}
                `}
                strokeWidth={active ? 2 : 1.5}
              />

              <span
                className={`
                  text-[11px] font-medium tracking-wide
                  ${active
                    ? "text-black"
                    : "text-gray-400 group-hover:text-gray-600"}
                `}
              >
                {item.label}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
