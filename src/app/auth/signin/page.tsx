import { Metadata } from "next"
import { SignInForm } from "@/components/auth/signin-form"

export const metadata: Metadata = {
    title: "Sign In | KPC Inventory",
    description: "Sign in to your KPC Inventory account",
}

export default function SignInPage() {
    return (
        <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800">
            {/* Animated Background Elements */}
            <div className="absolute inset-0">
                <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-blue-600/20 via-purple-600/20 to-pink-600/20"></div>

                {/* Floating Geometric Shapes */}
                <div className="absolute top-20 left-20 w-64 h-64 bg-gradient-to-r from-cyan-400/30 to-blue-500/30 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute top-40 right-32 w-48 h-48 bg-gradient-to-r from-purple-400/40 to-pink-500/40 rounded-full blur-2xl animate-bounce"></div>
                <div className="absolute bottom-32 left-40 w-56 h-56 bg-gradient-to-r from-indigo-400/30 to-purple-500/30 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute bottom-20 right-20 w-40 h-40 bg-gradient-to-r from-pink-400/40 to-red-500/40 rounded-full blur-2xl animate-bounce"></div>

                {/* Grid Pattern */}
                <div className="absolute inset-0 opacity-40" style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Ccircle cx='30' cy='30' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
                }}></div>

                {/* Gradient Overlays */}
                <div className="absolute top-0 left-0 w-1/3 h-full bg-gradient-to-r from-cyan-500/10 to-transparent"></div>
                <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-pink-500/10 to-transparent"></div>
                <div className="absolute bottom-0 left-0 w-full h-1/3 bg-gradient-to-t from-purple-900/20 to-transparent"></div>
            </div>

            <div className="relative z-10 flex min-h-screen">
                {/* Left side - Creative Branding */}
                <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-black/40 via-purple-900/30 to-black/40"></div>

                    {/* Animated Elements */}
                    <div className="absolute top-10 left-10 w-20 h-20 border-2 border-cyan-400/50 rounded-lg rotate-45 animate-spin"></div>
                    <div className="absolute top-32 right-16 w-16 h-16 border-2 border-pink-400/50 rounded-full animate-pulse"></div>
                    <div className="absolute bottom-40 left-16 w-12 h-12 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full animate-bounce"></div>
                    <div className="absolute bottom-20 right-32 w-8 h-8 bg-gradient-to-r from-cyan-400 to-blue-400 rounded-full animate-ping"></div>

                    <div className="relative z-10 flex flex-col justify-center px-12 text-white">
                        <div className="mb-12">
                            <div className="flex items-center mb-8">
                                <div className="w-16 h-16 bg-gradient-to-r from-cyan-400 to-purple-500 rounded-2xl flex items-center justify-center shadow-2xl backdrop-blur-sm border border-white/20">
                                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                    </svg>
                                </div>
                                <div className="ml-6">
                                    <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-300 via-purple-300 to-pink-300 bg-clip-text text-transparent">
                                        KPC Inventory
                                    </h1>
                                    <div className="w-32 h-1 bg-gradient-to-r from-cyan-400 to-purple-500 rounded-full mt-2"></div>
                                </div>
                            </div>

                            <h2 className="text-5xl font-bold mb-6 leading-tight bg-gradient-to-r from-white via-cyan-100 to-purple-100 bg-clip-text text-transparent">
                                Transform Your Business
                            </h2>
                            <p className="text-xl text-gray-200 mb-10 leading-relaxed">
                                Experience the future of inventory management with our cutting-edge platform.
                                Streamline operations, boost productivity, and unlock your business potential.
                            </p>
                        </div>

                        <div className="space-y-6">
                            <div className="flex items-center group">
                                <div className="w-12 h-12 bg-gradient-to-r from-cyan-400/20 to-purple-500/20 rounded-xl flex items-center justify-center mr-6 border border-cyan-400/30 group-hover:scale-110 transition-transform duration-300">
                                    <svg className="w-6 h-6 text-cyan-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                    </svg>
                                </div>
                                <span className="text-lg text-gray-200 group-hover:text-white transition-colors duration-300">Lightning-fast inventory tracking</span>
                            </div>
                            <div className="flex items-center group">
                                <div className="w-12 h-12 bg-gradient-to-r from-purple-400/20 to-pink-500/20 rounded-xl flex items-center justify-center mr-6 border border-purple-400/30 group-hover:scale-110 transition-transform duration-300">
                                    <svg className="w-6 h-6 text-purple-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                    </svg>
                                </div>
                                <span className="text-lg text-gray-200 group-hover:text-white transition-colors duration-300">Multi-location management</span>
                            </div>
                            <div className="flex items-center group">
                                <div className="w-12 h-12 bg-gradient-to-r from-pink-400/20 to-red-500/20 rounded-xl flex items-center justify-center mr-6 border border-pink-400/30 group-hover:scale-110 transition-transform duration-300">
                                    <svg className="w-6 h-6 text-pink-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                    </svg>
                                </div>
                                <span className="text-lg text-gray-200 group-hover:text-white transition-colors duration-300">Advanced analytics & insights</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right side - Login Form */}
                <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-purple-500/5 to-pink-500/10 backdrop-blur-sm"></div>

                    <div className="w-full max-w-md relative z-10">
                        <div className="lg:hidden text-center mb-10">
                            <div className="flex items-center justify-center mb-6">
                                <div className="w-16 h-16 bg-gradient-to-r from-cyan-400 to-purple-500 rounded-2xl flex items-center justify-center shadow-2xl">
                                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                    </svg>
                                </div>
                            </div>
                            <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-300 via-purple-300 to-pink-300 bg-clip-text text-transparent mb-2">
                                KPC Inventory
                            </h1>
                            <p className="text-gray-200 font-medium">Multi-Shop Inventory & Sales Management</p>
                        </div>
                        <SignInForm />
                    </div>
                </div>
            </div>
        </div >
    )
}