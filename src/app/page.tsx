import { Metadata } from "next"
import { SignInForm } from "@/components/auth/signin-form"

export const metadata: Metadata = {
    title: "Sign In | KPC Inventory",
    description: "Sign in to your KPC Inventory account",
}

export default function HomePage() {
    return (
        <div className="min-h-screen relative overflow-hidden">
            {/* Professional Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-gray-900 to-slate-800">
                {/* Subtle animated elements */}
                <div className="absolute inset-0 opacity-30">
                    <div className="absolute top-0 -left-4 w-96 h-96 bg-blue-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
                    <div className="absolute top-0 -right-4 w-96 h-96 bg-slate-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
                    <div className="absolute -bottom-8 left-20 w-96 h-96 bg-gray-700 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
                </div>

                {/* Professional geometric elements */}
                <div className="absolute inset-0">
                    <div className="absolute top-10 left-10 w-16 h-16 border border-slate-600/20 rounded-lg rotate-45 animate-spin-slow"></div>
                    <div className="absolute top-32 right-20 w-12 h-12 border border-blue-500/15 rounded-full animate-pulse"></div>
                    <div className="absolute bottom-20 left-20 w-8 h-8 bg-slate-600/15 rounded-lg animate-float"></div>
                    <div className="absolute bottom-40 right-40 w-6 h-6 bg-blue-500/15 rounded-full animate-float-delayed"></div>
                </div>

                {/* Subtle grid pattern */}
                <div className="absolute inset-0 opacity-5" style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='20' cy='20' r='1'/%3E%3C/g%3E%3C/svg%3E")`
                }}></div>
            </div>

            {/* Main Content */}
            <div className="relative z-10 flex min-h-screen">
                {/* Left Panel - Professional Branding */}
                <div className="hidden lg:flex lg:w-1/2 relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-black/30 via-slate-900/50 to-black/40 backdrop-blur-sm"></div>

                    <div className="relative z-10 flex flex-col justify-center px-16 text-white">
                        {/* Logo Section */}
                        <div className="mb-16">
                            <div className="flex items-center mb-8">
                                <div className="relative">
                                    <div className="w-20 h-20 bg-gradient-to-r from-blue-600 to-slate-700 rounded-2xl flex items-center justify-center shadow-2xl border border-slate-600/30">
                                        <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                        </svg>
                                    </div>
                                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-blue-500 rounded-full animate-pulse"></div>
                                </div>
                                <div className="ml-6">
                                    <h1 className="text-5xl font-black bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
                                        KPC
                                    </h1>
                                    <p className="text-xl text-slate-300 font-semibold tracking-wide">INVENTORY</p>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <h2 className="text-5xl font-black leading-tight">
                                    <span className="bg-gradient-to-r from-white to-slate-200 bg-clip-text text-transparent">Professional</span>
                                    <br />
                                    <span className="bg-gradient-to-r from-slate-200 to-blue-200 bg-clip-text text-transparent">Inventory</span>
                                    <br />
                                    <span className="bg-gradient-to-r from-blue-200 to-white bg-clip-text text-transparent">Management</span>
                                </h2>
                                <div className="w-24 h-1.5 bg-gradient-to-r from-blue-600 to-slate-600 rounded-full"></div>
                                <p className="text-xl text-slate-300 leading-relaxed max-w-lg">
                                    Streamline your business operations with enterprise-grade inventory management.
                                    Built for efficiency, designed for growth.
                                </p>
                            </div>
                        </div>

                        {/* Professional Features */}
                        <div className="space-y-8">
                            <div className="flex items-center group cursor-pointer">
                                <div className="w-14 h-14 bg-gradient-to-r from-blue-600/20 to-slate-600/20 rounded-xl flex items-center justify-center mr-6 border border-blue-500/20 group-hover:scale-105 group-hover:bg-blue-600/30 transition-all duration-300">
                                    <svg className="w-7 h-7 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                    </svg>
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-white group-hover:text-blue-200 transition-colors">Real-time Analytics</h3>
                                    <p className="text-slate-400 group-hover:text-slate-300 transition-colors">Monitor inventory across all locations</p>
                                </div>
                            </div>

                            <div className="flex items-center group cursor-pointer">
                                <div className="w-14 h-14 bg-gradient-to-r from-slate-600/20 to-gray-600/20 rounded-xl flex items-center justify-center mr-6 border border-slate-500/20 group-hover:scale-105 group-hover:bg-slate-600/30 transition-all duration-300">
                                    <svg className="w-7 h-7 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                    </svg>
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-white group-hover:text-slate-200 transition-colors">Multi-Location Control</h3>
                                    <p className="text-slate-400 group-hover:text-slate-300 transition-colors">Centralized management system</p>
                                </div>
                            </div>

                            <div className="flex items-center group cursor-pointer">
                                <div className="w-14 h-14 bg-gradient-to-r from-gray-600/20 to-blue-600/20 rounded-xl flex items-center justify-center mr-6 border border-gray-500/20 group-hover:scale-105 group-hover:bg-gray-600/30 transition-all duration-300">
                                    <svg className="w-7 h-7 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
                                    </svg>
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-white group-hover:text-gray-200 transition-colors">Advanced Reporting</h3>
                                    <p className="text-slate-400 group-hover:text-slate-300 transition-colors">Data-driven business insights</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Panel - Login Form */}
                <div className="flex-1 flex items-center justify-center px-6 sm:px-8 lg:px-12 relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-slate-500/5 to-blue-500/5 backdrop-blur-sm"></div>

                    <div className="w-full max-w-md relative z-10">
                        {/* Mobile Header */}
                        <div className="lg:hidden text-center mb-12">
                            <div className="flex items-center justify-center mb-6">
                                <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-slate-700 rounded-2xl flex items-center justify-center shadow-2xl border border-slate-600/30">
                                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                    </svg>
                                </div>
                            </div>
                            <h1 className="text-4xl font-black bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent mb-2">
                                KPC Inventory
                            </h1>
                            <p className="text-slate-300 font-medium text-lg">Professional Management System</p>
                        </div>

                        <SignInForm />
                    </div>
                </div>
            </div>
        </div>
    )
}