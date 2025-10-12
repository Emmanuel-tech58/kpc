import { withAuth } from "next-auth/middleware"

export default withAuth(
    function middleware(req) {
        // Add any additional middleware logic here
    },
    {
        callbacks: {
            authorized: ({ token, req }) => {
                // Allow access to auth pages without token
                if (req.nextUrl.pathname.startsWith("/auth")) {
                    return true
                }

                // Require token for protected routes
                if (req.nextUrl.pathname.startsWith("/dashboard") ||
                    req.nextUrl.pathname.startsWith("/api") &&
                    !req.nextUrl.pathname.startsWith("/api/auth")) {
                    return !!token
                }

                return true
            },
        },
    }
)

export const config = {
    matcher: [
        "/dashboard/:path*",
        "/api/:path*",
        "/auth/:path*"
    ]
}