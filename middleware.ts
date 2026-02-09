import { NextRequest, NextResponse } from "next/server";
import { decrypt } from "@/lib/auth";

// 1. Specify protected and public routes
const protectedRoutes = ["/", "/dashboard", "/market", "/portfolio", "/simulation", "/settings", "/analysis"];
const publicRoutes = ["/login"];

export default async function middleware(req: NextRequest) {
    // 2. Check if the current route is protected or public
    const path = req.nextUrl.pathname;
    const isProtectedRoute = protectedRoutes.includes(path) || path.startsWith("/dashboard") || path.startsWith("/api");
    const isPublicRoute = publicRoutes.includes(path);

    // 3. Decrypt the session from the cookie
    const cookie = req.cookies.get("session")?.value;
    const session = cookie ? await decrypt(cookie).catch(() => null) : null;

    // 4. Redirect to /login if the user is not authenticated
    if (isProtectedRoute && !session && !path.startsWith("/api/login")) {
        return NextResponse.redirect(new URL("/login", req.nextUrl));
    }

    // 5. Redirect to / if the user is authenticated
    if (
        isPublicRoute &&
        session &&
        !req.nextUrl.pathname.startsWith("/")
    ) {
        return NextResponse.redirect(new URL("/", req.nextUrl));
    }

    return NextResponse.next();
}

// Routes Middleware should not run on
export const config = {
    matcher: ["/((?!api|_next/static|_next/image|.*\\.png$).*)"],
};
