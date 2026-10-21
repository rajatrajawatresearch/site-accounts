import { NextResponse, type NextRequest } from "next/server";
import { jwtVerify } from "jose";

const secret = new TextEncoder().encode(process.env.AUTH_SECRET ?? "dev-secret-change-me-please-32chars!");

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const token = req.cookies.get("sa_session")?.value;
  let valid = false;
  if (token) {
    try { await jwtVerify(token, secret); valid = true; } catch { valid = false; }
  }
  if (pathname === "/login") {
    return valid ? NextResponse.redirect(new URL("/", req.url)) : NextResponse.next();
  }
  if (!valid) {
    const url = new URL("/login", req.url);
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next|icons|manifest.webmanifest|sw.js|favicon.ico|.*\\..*).*)"],
};
