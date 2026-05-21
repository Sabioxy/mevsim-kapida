"use client";

import * as React from "react";
import { type AuthSession, readAuthSession, clearAuthSession } from "@/lib/auth";
import { usePathname, useRouter } from "next/navigation";

type AuthContextValue = {
    session: AuthSession | null;
    isLoading: boolean;
    logout: () => void;
};

const AuthContext = React.createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [session, setSession] = React.useState<AuthSession | null>(null);
    const [isLoading, setIsLoading] = React.useState(true);
    const router = useRouter();
    const pathname = usePathname();

    React.useEffect(() => {
        const currentSession = readAuthSession();
        setSession(currentSession);
        setIsLoading(false);

        if (currentSession) {
            // If logged in, don't show login/register pages
            if (pathname === "/login" || pathname === "/register") {
                router.replace("/");
            }
        }
    }, [pathname, router]);

    const logout = async () => {
        await fetch("/api/auth/logout", { method: "POST" });
        clearAuthSession();
        setSession(null);
        window.location.href = "/"; // Force reload to clear all state
    };

    const value = { session, isLoading, logout };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
    const context = React.useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};
