"use client"

import React, { useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Lock, LogIn, TrendingUp } from "lucide-react"

export default function LoginPage() {
    const [password, setPassword] = useState("")
    const [error, setError] = useState("")
    const [loading, setLoading] = useState(false)
    const router = useRouter()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError("")

        const formData = new FormData()
        formData.append("password", password)

        try {
            const res = await fetch("/api/login", {
                method: "POST",
                body: formData,
            })

            const data = await res.json()

            if (data.success) {
                router.push("/")
                router.refresh()
            } else {
                setError(data.message || "Invalid password")
            }
        } catch (err) {
            setError("Something went wrong. Please try again.")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen grid lg:grid-cols-2 bg-neutral-950 text-neutral-100 overflow-hidden">
            {/* Left Side - Visual Branding */}
            <div className="hidden lg:flex flex-col justify-between p-12 relative overflow-hidden bg-neutral-900/50 border-r border-neutral-800/50">
                <div className="relative z-10">
                    <div className="flex items-center gap-2 mb-8">
                        <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(59,130,246,0.3)]">
                            <TrendingUp className="w-6 h-6 text-white" />
                        </div>
                        <span className="text-2xl font-bold tracking-tighter">Stocky</span>
                    </div>
                </div>

                <div className="relative z-10 space-y-4">
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-5xl font-bold leading-tight tracking-tight"
                    >
                        Advanced Asset <br />
                        <span className="text-blue-500">Analysis Platform.</span>
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-neutral-400 text-lg max-w-md"
                    >
                        Secure, real-time insights for the modern investor. Monitor your portfolio and market trends with precision.
                    </motion.p>
                </div>

                <div className="relative z-10 flex items-center gap-4 text-xs font-medium text-neutral-500 uppercase tracking-widest">
                    <span>Precision</span>
                    <span className="w-1 h-1 bg-neutral-700 rounded-full" />
                    <span>Security</span>
                    <span className="w-1 h-1 bg-neutral-700 rounded-full" />
                    <span>Real-time</span>
                </div>

                {/* Background Decorations */}
                <div className="absolute top-[-10%] right-[-10%] w-96 h-96 bg-blue-500/10 blur-[120px] rounded-full" />
                <div className="absolute bottom-[-5%] left-[-5%] w-64 h-64 bg-emerald-500/10 blur-[100px] rounded-full" />
            </div>

            {/* Right Side - Login Form */}
            <div className="flex items-center justify-center p-8 relative">
                <div className="absolute top-0 left-0 w-full h-full lg:hidden opacity-20 pointer-events-none">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-blue-500/20 blur-[100px] rounded-full" />
                </div>

                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="w-full max-w-sm space-y-8"
                >
                    <div className="space-y-2 text-center lg:text-left">
                        <h2 className="text-3xl font-bold tracking-tight">Access Secure Dashboard</h2>
                        <p className="text-neutral-400">Enter your credentials to continue to Stocky.</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-neutral-300 ml-1" htmlFor="password">
                                Security Code
                            </label>
                            <div className="relative group">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500 group-focus-within:text-blue-500 transition-colors" />
                                <input
                                    id="password"
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="w-full bg-neutral-900 border border-neutral-800 rounded-xl py-3 px-10 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-neutral-700"
                                    required
                                />
                            </div>
                        </div>

                        {error && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm py-3 px-4 rounded-xl"
                            >
                                {error}
                            </motion.div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold py-3 rounded-xl transition-all shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <>
                                    <span>Sign In</span>
                                    <LogIn className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="pt-8 text-center lg:text-left border-t border-neutral-900">
                        <p className="text-xs text-neutral-500">
                            By signing in, you agree to our Terms of Service and Privacy Policy. Securely encrypted and processed.
                        </p>
                    </div>
                </motion.div>
            </div>
        </div>
    )
}
