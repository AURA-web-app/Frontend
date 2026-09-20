import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/createServerClient";

export async function GET(request: NextRequest) {
    const code = request.nextUrl.searchParams.get("code");

    if (code === null) {
        return NextResponse.redirect(new URL("/login", request.url));
    }

    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
        return NextResponse.redirect(new URL("/login", request.url));
    } else {
        return NextResponse.redirect(new URL("/dashboard", request.url));
    }
}