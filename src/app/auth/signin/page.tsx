import { Metadata } from "next"
import { SignInForm } from "@/components/auth/signin-form"

export const metadata: Metadata = {
    title: "Sign In | KPC Inventory",
    description: "Sign in to your KPC Inventory account",
}

export default function SignInPage() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="w-full max-w-md space-y-8">
                <div className="text-center">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">KPC Inventory</h1>
                    <p className="text-gray-600">Multi-Shop Inventory & Sales Management</p>
                </div>
                <SignInForm />
            </div>
        </div>
    )
}