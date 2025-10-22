"use client"

import { useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, Eye, EyeOff } from "lucide-react"
import { toast } from "sonner"

export function SignInForm() {
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [showPassword, setShowPassword] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState("")
    const router = useRouter()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)
        setError("")

        try {
            const result = await signIn("credentials", {
                email,
                password,
                redirect: false,
            })

            if (result?.error) {
                setError("Invalid email or password")
                toast.error("Sign in failed", {
                    description: "Please check your credentials and try again."
                })
            } else {
                toast.success("Welcome back!", {
                    description: "You have been signed in successfully."
                })
                router.push("/dashboard")
                router.refresh()
            }
        } catch (error) {
            setError("An unexpected error occurred")
            toast.error("Something went wrong", {
                description: "Please try again later."
            })
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="w-full">
            <Card className="border-0 shadow-2xl bg-white/95 backdrop-blur-sm">
                <CardHeader className="space-y-1 pb-6">
                    <CardTitle className="text-3xl font-bold text-center text-gray-900">
                        Welcome Back
                    </CardTitle>
                    <CardDescription className="text-center text-gray-600 text-base">
                        Sign in to access your dashboard
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {error && (
                            <Alert variant="destructive" className="border-red-200 bg-red-50">
                                <AlertDescription className="text-red-800">{error}</AlertDescription>
                            </Alert>
                        )}

                        <div className="space-y-2">
                            <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                                Email Address
                            </Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="Enter your email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                disabled={isLoading}
                                className="h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500 transition-colors"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                                Password
                            </Label>
                            <div className="relative">
                                <Input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Enter your password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    disabled={isLoading}
                                    className="h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500 pr-12 transition-colors"
                                />
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    className="absolute right-0 top-0 h-12 px-3 hover:bg-gray-100 text-gray-400 hover:text-gray-600"
                                    onClick={() => setShowPassword(!showPassword)}
                                    disabled={isLoading}
                                >
                                    {showPassword ? (
                                        <EyeOff className="h-4 w-4" />
                                    ) : (
                                        <Eye className="h-4 w-4" />
                                    )}
                                </Button>
                            </div>
                        </div>

                        <Button
                            type="submit"
                            className="w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
                            disabled={isLoading}
                        >
                            {isLoading && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
                            {isLoading ? "Signing In..." : "Sign In"}
                        </Button>
                    </form>

                    <div className="text-center">
                        <p className="text-sm text-gray-500">
                            Enter your credentials to continue
                        </p>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}