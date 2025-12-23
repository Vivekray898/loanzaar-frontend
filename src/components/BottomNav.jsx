"use client"

import React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, LayoutGrid, Clock, LifeBuoy, User } from "lucide-react"

export default function BottomNav({ items } = {}) {
  const pathname = usePathname() || "/"

  const navItems = items || [
    { key: "home", label: "Home", path: "/", icon: Home },
    { key: "products", label: "Products", path: "/products", icon: LayoutGrid },
    { key: "support", label: "Support", path: "/support", icon: LifeBuoy },
    { key: "account", label: "Account", path: "/account", icon: User },
  ]

  const isActive = (path) =>
    path === "/" ? pathname === "/" : pathname.startsWith(path)

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50">
      {/* 
        iOS Style Background: 
        - High transparency (white/85) 
        - Heavy blur (backdrop-blur-xl)
        - Hairline top border (border-gray-200)
      */}
      <div className="bg-white/85 backdrop-blur-xl border-t border-gray-200 shadow-sm pb-[env(safe-area-inset-bottom)] transition-all duration-300">
        <div className="flex items-start justify-around pt-2 h-[84px] md:h-[60px]">
          {navItems.map((item) => {
            const active = isActive(item.path)
            const Icon = item.icon

            return (
              <Link
                key={item.key}
                href={item.path}
                className="group flex-1 flex flex-col items-center justify-start focus:outline-none active:opacity-70 transition-opacity duration-150"
              >
                <div className="relative flex flex-col items-center gap-[3px]">
                  {/* Icon */}
                  <Icon
                    className={`
                      w-[26px] h-[26px] transition-all duration-300
                      ${
                        active
                          ? "text-blue-500 stroke-[2.5px] scale-100" // Active: Blue & Bold
                          : "text-gray-400 stroke-[1.5px] group-hover:text-gray-500" // Inactive: Gray & Thin
                      }
                    `}
                  />

                  {/* Label */}
                  <span
                    className={`
                      text-[10px] font-medium tracking-tight leading-none
                      ${
                        active
                          ? "text-blue-500"
                          : "text-gray-400 group-hover:text-gray-500"
                      }
                    `}
                  >
                    {item.label}
                  </span>
                </div>
              </Link>
            )
          })}
        </div>
      </div>
    </nav>
  )
}