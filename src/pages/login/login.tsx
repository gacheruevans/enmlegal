import { useState } from 'react';
import { EnvelopeIcon, KeyIcon } from '@heroicons/react/24/outline'
// import { useRouter } from "next/navigation";
import  api from '../../lib/api';

export const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    // const router = useRouter();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const { data } = await api.post('/auth/login', {email, password});
            localStorage.setItem('token', data.accessToken);
            localStorage.setItem('user', JSON.stringify(data.user));

            if(data.user.role === 'Admin') {
                // router.push("/admin/blog-posts");
            }
        } catch (error: any) {
             setError(error.response?.data?.message || "Invalid credentials");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-background bg-linear-to-br from-green-50/50 via-white to-blue-50/50">
            <div className="w-full max-w-md">
                <div className="flex flex-col items-center mb-10">
                    <div className="flex items-center justify-center w-16 h-16 mb-6 text-white transition-transform transform bg-brand-primary rounded-2xl shadow-premium hover:rotate-6">
                    </div>
                    <h1 className="text-3xl font-black tracking-tight font-mea-culpa text-secondary">ENM LEGAL ADMIN</h1>
                    <p className="mt-1 text-xs font-bold tracking-widest uppercase text-slate-500">Blog Post Management System</p>
                </div>

                <div className="relative p-10 overflow-hidden bg-white border rounded-4xl shadow-premium border-slate-100">
                    <div className="absolute top-0 right-0 w-32 h-32 translate-x-16 -translate-y-16 rounded-full bg-blue-50"></div>

                    <div className="relative z-10">
                        <h2 className="mb-2 text-xl font-bold font-mea-culpa text-royal">Welcome Back!</h2>
                        <p className="mb-8 text-sm text-slate-500">Sign in to your account to continue</p>

                        <form onSubmit={handleLogin} className="space-y-6">
                            <div className="space-y-2">
                                <label className="ml-1 text-xs font-bold tracking-wider uppercase text-slate-700">Email Address</label>
                                <div className="relative">
                                    <EnvelopeIcon className="absolute h-8 -translate-y-1/2 left-4 top-1/2 text-slate-400" />
                                    <input
                                        type="email"
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full py-4 pl-12 pr-4 transition-all border outline-none bg-slate-50 border-slate-100 rounded-2xl focus:ring-2 focus:ring-brand-primary/10 focus:border-brand-primary/20 text-slate-800 placeholder:text-slate-300"
                                        placeholder="Enter your email"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="ml-1 text-xs font-bold tracking-wider uppercase text-slate-700">Password</label>
                                <div className="relative">
                                    <KeyIcon className="absolute h-8 -translate-y-1/2 left-4 top-1/2 text-slate-400" />
                                    <input
                                        type="password"
                                        required
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full py-4 pl-12 pr-4 transition-all border outline-none bg-slate-50 border-slate-100 rounded-2xl focus:ring-2 focus:ring-brand-primary/10 focus:border-brand-primary/20 text-slate-800 placeholder:text-slate-300"
                                        placeholder="••••••••"
                                    />
                                </div>
                            </div>

                            {error && (
                                <div className="flex items-center gap-2 p-4 text-xs font-bold text-red-500 border border-red-100 bg-red-50 rounded-xl animate-shake">
                                    <div className="w-1.5 h-1.5 bg-red-500 rounded-full"></div>
                                    {error}
                                </div>
                            )}

                            <button
                                disabled={loading}
                                className="flex items-center justify-center w-full gap-2 py-4 font-bold text-white transition-all bg-blue-500 btn-primary rounded-2xl active:scale-95"
                            >
                            {loading ? 
                                <div className="flex items-center justify-center min-h-[300px]">
                                    <div className="w-8 h-8 border-2 rounded-full animate-spin border-royal border-t-transparent"></div>
                                </div> : "Sign In to Admin Dashboard"}
                            </button>
                        </form>

                        <div className="mt-8 text-center">
                            <p className="font-sans text-xs font-medium tracking-tighter text-slate-400">Developed & <span className="font-bold text-green-700 uppercase">Powered by Pentaclover LTD </span> all rights reserved @2026</p>
                        </div>
                    </div>
                    <div className="absolute w-32 h-32 translate-x-16 -translate-y-16 rounded-full opacity-50 -bottom-32 -left-24 bg-royal"></div>
                </div>
            </div>
        </div>
    );
}
