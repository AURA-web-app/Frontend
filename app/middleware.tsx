import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import type { CookieOptions } from "@supabase/ssr";

export async function middleware(req: NextRequest) {
    const res = NextResponse.next();
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                get(name: string) {
                    return req.cookies.get(name)?.value;
                },
                set(name: string, value: string, options: CookieOptions) {
                    res.cookies.set(name, value, options);
                },
            },
        }
    );

    const {
        data: { session },
    } = await supabase.auth.getSession();

    const pathname = req.nextUrl.pathname;
    const isAuthPage = pathname === "/login" ||
                       pathname === "/signup" ||
                       pathname === "/forgot-password" ||
                       pathname === "/auth";
    if (isAuthPage && session) {
        return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    if (!session) {
        const isProtected = pathname.startsWith("/dashboard") ||
                            pathname.startsWith("/exam") ||
                            pathname.startsWith("/courses") ||
                            pathname.startsWith("/profile") ||
                            pathname.startsWith("/calendar") ||
                            pathname.startsWith("/pyqs") ||
                            pathname.startsWith("/mistake-nb") ||
                            pathname.startsWith("/creator") ||
                            pathname.startsWith("/admin");
        if (isProtected) {
            return NextResponse.redirect(new URL("/login", req.url));
        }
        return res;
    }

    let role = 'user';
    try {
        const { data: profile, error } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', session.user.id)
            .single();

        if (profile) {
            role = profile.role || 'user';
        }
    } catch (e) {
        console.error('Error fetching profile:', e);
    }
    if (pathname.startsWith("/admin") && role !== 'admin') {
        return NextResponse.redirect(new URL("/dashboard", req.url));
    }
    if (pathname.startsWith("/creator") && !['creator', 'admin'].includes(role)) {
        return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    return res;
}

export const config = {
    matcher: [
        "/dashboard/:path*",
        "/exam/:path*",
        "/courses/:path*",
        "/profile/:path*",
        "/calendar/:path*",
        "/pyqs/:path*",
        "/mistake-nb/:path*",
        "/creator/:path*",
        "/admin/:path*",
        "/login",
        "/signup",
        "/forgot-password",
        "/auth",
    ],
};