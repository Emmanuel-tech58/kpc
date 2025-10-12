export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            KPC Inventory
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Complete multi-shop inventory and sales management system.
            Track stock, manage sales, calculate profits, and get real-time notifications.
          </p>
          <a
            href="/auth/signin"
            className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 text-lg px-8 py-3"
          >
            Get Started
          </a>
        </div>

        <div className="text-center">
          <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold mb-2">Demo Access</h3>
            <p className="text-gray-600 mb-4">Try the system with demo credentials</p>
            <div className="space-y-2 text-sm">
              <p><strong>Email:</strong> admin@kpc.com</p>
              <p><strong>Password:</strong> admin123</p>
              <a
                href="/auth/signin"
                className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 w-full mt-4"
              >
                Sign In
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}