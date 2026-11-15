import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { SUPABASE_ANON_KEY, SUPABASE_URL } from "./lib/supabase/config";

// Refresca la sesión del panel en cada petición y protege /panel.
export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });
  const supabase = createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: (list) => {
        list.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        list.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      },
    },
  });

  const { data } = await supabase.auth.getUser();
  const path = request.nextUrl.pathname;
  const isPublicPanel = path === "/panel/login" || path === "/panel/password";
  if (!data.user && path.startsWith("/panel") && !isPublicPanel) {
    return NextResponse.redirect(new URL("/panel/login", request.url));
  }
  return response;
}

export const config = { matcher: ["/panel/:path*"] };
