import { NextResponse, type NextRequest } from "next/server"
// import { updateSession } from "./app/utils/supabase/proxy"


export async function proxy(request: NextRequest) {
    // 1. Maintenance gate — synchronous, no DB involved.
    // const maintenanceResponse = maintenanceModeCheck(request)
    // if (maintenanceResponse.status !== 200) return maintenanceResponse

    // 2. Session refresh + shared Supabase client.
    //    updateSession creates the client ONCE and handles auth redirects.
    //    All downstream handlers receive this same client — no re-instantiation.
    // const { supabaseResponse, supabase } = await updateSession(request)
    // if (supabaseResponse.status !== 200) return supabaseResponse
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * Feel free to modify this pattern to include more paths.
         */
        "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
    ],
}