import { Metadata } from "next"
import { SignInForm } from "@/components/auth/signin-form"

export const metadata: Metadata = {
    title: "Sign In | KPC Inventory",
    description: "Sign in to your KPC Inventory account",
}

export default function HomePage() {
    return (
        <div className="min-h-screen relative overflow-hidden">
            {/* Dynamic Animated Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
                {/* Animated mesh gradient */}
                <div className="absolute inset-0 opacity-70">
                    <div className="absolute top-0 -left-4 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
                    <div className="absolute top-0 -right-4 w-72 h-72 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
                    <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
                </div>

                {/* Geometric patterns */}
                <div className="absolute inset-0">
                    <svg className="absolute top-10 left-10 w-20 h-20 text-purple-400/20 animate-spin-slow" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11.707 4.707a1 1 0 00-1.414-1.414L10 9.586 8.707 8.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <div className="absolute top-20 right-20 w-16 h-16 border-2 border-cyan-400/30 rounded-lg rotate-45 animate-pulse"></div>
                    <div className="absolute bottom-20 left-20 w-12 h-12 bg-gradient-to-r from-pink-400/30 to-purple-400/30 rounded-full animate-bounce"></div>
                    <div className="absolute bottom-40 right-40 w-8 h-8 bg-yellow-400/40 rounded-full animate-ping"></div>
                </div>

                {/* Floating particles */}
                <div className="absolute inset-0">
                    <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-white/20 rounded-full animate-float"></div>
                    <div className="absolute top-3/4 left-1/3 w-1 h-1 bg-purple-300/40 rounded-full animate-float-delayed"></div>
                    <div className="absolute top-1/2 right-1/4 w-3 h-3 bg-cyan-300/30 rounded-full animate-float"></div>
                    <div className="absolute bottom-1/4 right-1/3 w-2 h-2 bg-pink-300/40 rounded-full animate-float-delayed"></div>
                </div>
            </div>

            {/* Main Content */}
            <div className="relative z-10 flex min-h-screen">
                {/* Left Panel - Branding */}
                <div className="hidden lg:flex lg:w-1/2 relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-black/20 via-purple-900/40 to-black/30 backdrop-blur-sm"></div>

                    <div className="relative z-10 flex flex-col justify-center px-16 text-white">
                        {/* Logo Section */}
                        <div className="mb-16">
                            <div className="flex items-center mb-8">
                                <div className="relative">
                                    <div className="w-20 h-20 bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 rounded-3xl flex items-center justify-center shadow-2xl">
                                        <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                        </svg>
                                    </div>
                                    <div className="absolute -top-2 -right-2 w-6 h-6 bg-yellow-400 rounded-full animate-pulse"></div>
                                </div>
                                <div className="ml-6">
                                    <h1 className="text-5xl font-black bg-gradient-to-r from-white via-cyan-200 to-purple-200 bg-clip-text text-transparent">
                                        KPC
                                    </h1>
                                    <p className="text-xl text-cyan-200 font-semibold tracking-wide">INVENTORY</p>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <h2 className="text-6xl font-black leading-tight">
                                    <span className="bg-gradient-to-r from-white to-cyan-200 bg-clip-text text-transparent">Smart</span>
                                    <br />
                                    <span className="bg-gradient-to-r from-purple-200 to-pink-200 bg-clip-text text-transparent">Business</span>
                                    <br />
                                    <span className="bg-gradient-to-r from-cyan-200 to-white bg-clip-text text-transparent">Solutions</span>
                                </h2>
                                <div className="w-24 h-1.5 bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 rounded-full"></div>
                                <p className="text-xl text-gray-300 leading-relaxed max-w-lg">
                                    Revolutionize your inventory management with cutting-edge technology.
                                    Scale your business, optimize operations, and drive growth.
                                </p>
                            </div>
                        </div>

                        {/* Features */}
                        <div className="space-y-8">
                            <div className="flex items-center group cursor-pointer">
                                <div className="w-14 h-14 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 rounded-2xl flex items-center justify-center mr-6 border border-cyan-400/30 group-hover:scale-110 group-hover:bg-cyan-500/30 transition-all duration-300">
                                    <svg className="w-7 h-7 text-cyan-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                    </svg>
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-white group-hover:text-cyan-200 transition-colors">Real-time Tracking</h3>
                                    <p className="text-gray-400 group-hover:text-gray-300 transition-colors">Monitor inventory across all locations</p>
                                </div>
                            </div>

                            <div className="flex items-center group cursor-pointer">
                                <div className="w-14 h-14 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-2xl flex items-center justify-center mr-6 border border-purple-400/30 group-hover:scale-110 group-hover:bg-purple-500/30 transition-all duration-300">
                                    <svg className="w-7 h-7 text-purple-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                    </svg>
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-white group-hover:text-purple-200 transition-colors">Multi-Shop Management</h3>
                                    <p className="text-gray-400 group-hover:text-gray-300 transition-colors">Centralized control for all locations</p>
                                </div>
                            </div>

                            <div className="flex items-center group cursor-pointer">
                                <div className="w-14 h-14 bg-gradient-to-r from-pink-500/20 to-red-500/20 rounded-2xl flex items-center justify-center mr-6 border border-pink-400/30 group-hover:scale-110 group-hover:bg-pink-500/30 transition-all duration-300">
                                    <svg className="w-7 h-7 text-pink-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                    </svg>
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-white group-hover:text-pink-200 transition-colors">Advanced Analytics</h3>
                                    <p className="text-gray-400 group-hover:text-gray-300 transition-colors">Data-driven insights and reporting</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Panel - Login Form */}
                <div className="flex-1 flex items-center justify-center px-6 sm:px-8 lg:px-12 relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-purple-500/5 to-pink-500/5 backdrop-blur-sm"></div>

                    <div className="w-full max-w-md relative z-10">
                        {/* Mobile Header */}
                        <div className="lg:hidden text-center mb-12">
                            <div className="flex items-center justify-center mb-6">
                                <div className="w-16 h-16 bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-2xl">
                                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                    </svg>
                                </div>
                            </div>
                            <h1 className="text-4xl font-black bg-gradient-to-r from-white via-cyan-200 to-purple-200 bg-clip-text text-transparent mb-2">
                                KPC Inventory
                            </h1>
                            <p className="text-gray-300 font-medium text-lg">Multi-Shop Management System</p>
                        </div>

                        <SignInForm />
                    </div>
                </div>
            </div>


        </div>
    )
}