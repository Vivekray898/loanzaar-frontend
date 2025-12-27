"use client"

import React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Home,
  Briefcase,
  PlusCircle,
  Shield,
  User,
  LucideIcon
} from "lucide-react"

export interface NavItem {
  key: string
  label: string
  path: string
  icon: LucideIcon
  primary?: boolean
}

interface BottomNavProps {
  items?: NavItem[]
}

export default function BottomNav({ items }: BottomNavProps) {
  const pathname = usePathname() || "/"

  // --- Dynamic Hide Logic ---
  // Adding "/insurance/" ensures the main "/insurance" page is visible,
  // but "/insurance/general-insurance" (or any other sub-page) is hidden.
  const hidePrefixes = [
    "/loans/", 
    "/apply/", 
    "/insurance/", 
    "/car-loan/"
  ];

  const shouldHideOnMobile = pathname && hidePrefixes.some(prefix => pathname.startsWith(prefix));
  
  const responsiveHideClass = shouldHideOnMobile ? "hidden lg:block" : ""

  const defaultItems: NavItem[] = [
    { key: "home", label: "Home", path: "/", icon: Home },
    { key: "loans", label: "Loans", path: "/loans", icon: Briefcase },
    // 🔥 Primary Action (Apply)
    { key: "apply", label: "Apply", path: "/apply", icon: PlusCircle, primary: true },
    { key: "insurance", label: "Insurance", path: "/insurance", icon: Shield },
    { key: "profile", label: "Profile", path: "/account", icon: User },
  ]

  const navItems = items || defaultItems

  const isActive = (path: string) =>
    path === "/" ? pathname === "/" : pathname.startsWith(path)

  return (
    <div className={`${responsiveHideClass} fixed bottom-6 left-0 right-0 z-50 px-4 pointer-events-none`}>
      <nav className="mx-auto max-w-lg w-full bg-white/95 backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.12)] border border-slate-200/60 rounded-[2rem] px-1.5 py-1.5 pointer-events-auto">
        <div className="flex items-center justify-between h-[54px]">
          {navItems.map((item) => {
            const active = isActive(item.path)
            const Icon = item.icon

            // 🌟 Primary Center Button
            if (item.primary) {
              return (
                <Link
                  key={item.key}
                  href={item.path}
                  className="relative flex-1 flex items-center justify-center -top-3"
                >
                  <div className={`
                    w-14 h-14 rounded-full flex items-center justify-center shadow-xl transition-all duration-300 active:scale-90
                    ${active 
                      ? "bg-blue-600 text-white" 
                      : "bg-slate-900 text-white"
                    }
                  `}>
                    <Icon className="w-7 h-7" strokeWidth={2.5} />
                  </div>
                </Link>
              )
            }

            return (
              <Link
                key={item.key}
                href={item.path}
                className="group relative flex-1 flex flex-col items-center justify-center focus:outline-none h-full px-0.5"
              >
                {/* Visual Indicator: Using w-full inside parent px-0.5 prevents overlap on tiny screens */}
                <div className={`
                  w-full flex flex-col items-center justify-center py-1.5 rounded-2xl transition-all duration-300
                  ${active ? "bg-blue-50 text-blue-600" : "text-slate-400 hover:text-slate-600"}
                `}>
                  <Icon
                    className={`w-5 h-5 mb-0.5 transition-all duration-300 ${active ? "stroke-[2.5px]" : "stroke-[2px]"}`}
                  />
                  <span className={`
                    text-[9px] font-bold uppercase tracking-tight text-center truncate w-full px-1
                    ${active ? "opacity-100" : "opacity-70 group-hover:opacity-100"}
                  `}>
                    {item.label}
                  </span>
                </div>
              </Link>
            )
          })}
        </div>
      </nav>
    </div>
  )
}