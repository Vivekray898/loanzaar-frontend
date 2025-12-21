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
    <nav
      aria-label="Mobile navigation"
      className="md:hidden fixed bottom-0 left-0 right-0 z-50"
    >
      {/* Glass Container */}
      <div className="bg-white/80 backdrop-blur-2xl border-t border-slate-200/60 shadow-[0_-8px_30px_rgba(0,0,0,0.06)] pb-[env(safe-area-inset-bottom)]">
        <div className="flex items-center justify-around h-[68px] px-1">
          {navItems.map((item) => {
            const active = isActive(item.path)
            const Icon = item.icon

            return (
              <Link
                key={item.key}
                href={item.path}
                className="relative flex-1 h-full flex flex-col items-center justify-center group focus:outline-none"
              >
                {/* Active Glow */}
                {active && (
                  <span className="absolute top-2 h-8 w-10 rounded-full bg-blue-500/10 blur-md" />
                )}

                {/* Icon Pill */}
                <div
                  className={`
                    relative flex items-center justify-center
                    px-4 py-1.5 mb-1 rounded-2xl
                    transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)]
                    group-active:scale-90
                    ${
                      active
                        ? "bg-blue-100 text-blue-600 shadow-sm translate-y-[-1px]"
                        : "text-slate-400 group-hover:text-slate-600"
                    }
                  `}
                >
                  <Icon
                    className={`
                      w-[22px] h-[22px] transition-all duration-300
                      ${
                        active
                          ? "stroke-[2.5px] fill-blue-600/20"
                          : "stroke-2"
                      }
                    `}
                  />
                </div>

                {/* Label */}
                <span
                  className={`
                    text-[10px] tracking-wide transition-all duration-200
                    ${
                      active
                        ? "text-blue-600 font-semibold"
                        : "text-slate-500 font-medium"
                    }
                  `}
                >
                  {item.label}
                </span>
              </Link>
            )
          })}
        </div>
      </div>
    </nav>
  )
}
