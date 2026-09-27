import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function getSupabaseConfig() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseAnonKey || !supabaseServiceRoleKey) {
        return null;
    }

    return { supabaseUrl, supabaseAnonKey, supabaseServiceRoleKey };
}

export async function POST(request: Request) {
    try {
        const config = getSupabaseConfig();

        if (!config) {
            return NextResponse.json(
                {
                    error: "Missing SUPABASE_URL or SUPABASE_ANON_KEY in your environment file.",
                },
                { status: 500 }
            );
        }

        const body = await request.json();
        const email = typeof body.email === "string" ? body.email.trim() : "";
        const action = typeof body.action === "string" ? body.action : "";

        if (!email) {
            return NextResponse.json({ error: "Email is required." }, { status: 400 });
        }

        if (action === "send") {
            const response = await fetch(`${config.supabaseUrl}/auth/v1/otp`, {
                method: "POST",
                headers: {
                    apikey: config.supabaseAnonKey,
                    Authorization: `Bearer ${config.supabaseAnonKey}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    email,
                    create_user: true,
                }),
            });

            const data = await response.json().catch(() => ({}));

            if (!response.ok) {
                console.error("Supabase OTP send error:", response.status, data);
                return NextResponse.json(
                    {
                        error: data.error_description || data.msg || data.error || "Failed to send code.",
                    },
                    { status: response.status }
                );
            }

            return NextResponse.json({ success: true });
        }

        if (action === "verify") {
            const token = typeof body.token === "string" ? body.token.trim() : "";
            const password = typeof body.password === "string" ? body.password : "";
            const name = typeof body.name === "string" ? body.name.trim() : "";

            if (!token || !password || !name) {
                return NextResponse.json({ error: "Code, name, and password are required." }, { status: 400 });
            }

            const response = await fetch(`${config.supabaseUrl}/auth/v1/verify`, {
                method: "POST",
                headers: {
                    apikey: config.supabaseAnonKey,
                    Authorization: `Bearer ${config.supabaseAnonKey}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    email,
                    token,
                    type: "email",
                }),
            });

            const data = await response.json().catch(() => ({}));

            if (!response.ok) {
                console.error("Supabase OTP verify error:", response.status, data);
                return NextResponse.json(
                    {
                        error: data.error_description || data.msg || data.error || "Failed to verify code.",
                    },
                    { status: response.status }
                );
            }

            const verificationData = data as {
                access_token?: string;
                refresh_token?: string;
                user?: { id?: string };
            };
            const userId = verificationData.user?.id;

            if (!verificationData.access_token || !verificationData.refresh_token || !userId) {
                return NextResponse.json({ error: "Verification succeeded, but no session was returned." }, { status: 502 });
            }

            const supabaseAdmin = createClient(config.supabaseUrl, config.supabaseServiceRoleKey, {
                auth: { autoRefreshToken: false, persistSession: false },
            });
            const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(userId, {
                password,
                user_metadata: { full_name: name },
            });

            if (updateError) {
                console.error("Supabase signup user update error:", updateError);
                return NextResponse.json({ error: "Account verification succeeded, but setup failed." }, { status: 500 });
            }

            return NextResponse.json({
                success: true,
                access_token: verificationData.access_token,
                refresh_token: verificationData.refresh_token,
            });
        }

        return NextResponse.json({ error: "Invalid action." }, { status: 400 });
    } catch (error) {
        console.error("Email OTP route failed:", error);
        return NextResponse.json(
            { error: "Unable to process verification right now. Please try again." },
            { status: 500 }
        );
    }
}