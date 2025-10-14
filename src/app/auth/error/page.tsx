"use client"

import { useSearchParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertTriangle } from "lucide-react"
import Link from "next/link"
import { Suspense } from "react"

const errorMessages: Record<string, string> = {
    Configuration: "There is a problem with the server configuration.",
    AccessDenied: "You do not have permission to sign in.",
    Verification: "The verification token has expired or has already been used.",
    Default: "An error occurred during authentication.",
}

function ErrorContent() {
    const searchParams = useSearchParams()
    const error = searchParams.get("error")
    const errorMessage = error ? errorMessages[error] || errorMessages.Default : errorMessages.Default

    return (
        <Card className="w-full max-w-md mx-auto">
            <CardHeader className="space-y-1">
                <CardTitle className="text-2xl font-bold text-center flex items-center justify-center gap-2">
                    <AlertTriangle className="h-6 w-6 text-red-500" />
                    Authentication Error
                </CardTitle>
                <CardDescription className="text-center">
                    There was a problem signing you in
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <Alert variant="destructive">
                    <AlertDescription>{errorMessage}</AlertDescription>
                </Alert>

                <div className="space-y-2">
                    <Button asChild className="w-full">
                        <Link href="/auth/signin">Try Again</Link>
                    </Button>
                    <Button asChild variant="outline" className="w-full">
                        <Link href="/">Go Home</Link>
                    </Button>
                </div>
            </CardContent>
        </Card>
    )
}

export default function AuthErrorPage() {

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="w-full max-w-md space-y-8">
                <div className="text-center">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">KPC Inventory</h1>
                    <p className="text-gray-600">Multi-Shop Inventory & Sales Management</p>
                </div>

                <Suspense fallback={
                    <Card className="w-full max-w-md mx-auto">
                        <CardContent className="p-6">
                            <div className="text-center">Loading...</div>
                        </CardContent>
                    </Card>
                }>
                    <ErrorContent />
                </Suspense>
            </div>
        </div>
    )
}