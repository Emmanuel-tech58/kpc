import { withAuth } from "next-auth/middleware"

export default withAuth(
    function middleware(req) {
        // Add any additional middleware logic here if needed
    },
    {
        callbacks: {
            authorized: ({ token, req }) => {
                const { pathname } = req.nextUrl

                // Require token for dashboard routes
                if (pathname.startsWith("/dashboard")) {
                    return !!token
                }

                // Allow all other routes
                return true
            },
        },
        pages: {
            signIn: "/", // Redirect to homepage (which is now the login page)
        },
    }
)

export const config = {
    matcher: ["/dashboard/:path*"]
}