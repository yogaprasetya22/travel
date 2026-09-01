import { Head, Link } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { ArrowRight, Star, MapPin, CheckCircle, Quote } from 'lucide-react';
import { PageProps } from '@/Types';

interface Props extends PageProps {
    agent: any;
    tenant: any;
    registerUrl: string;
}

export default function Profile({ agent, tenant, registerUrl }: Props) {
    return (
        <>
            <Head title={`Profil Agen - ${agent.name}`} />

            <div className="min-h-screen bg-gray-50">
                {/* Hero Section */}
                <div className="relative bg-white overflow-hidden">
                    <div className="absolute inset-0">
                        <img
                            className="w-full h-full object-cover"
                            src="https://images.unsplash.com/photo-1542314831-c5a420b9e831?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80"
                            alt="Makkah"
                        />
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-900/90 to-black/60 mix-blend-multiply" />
                    </div>

                    <div className="relative max-w-7xl mx-auto py-24 px-4 sm:py-32 sm:px-6 lg:px-8">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8 }}
                            className="text-center"
                        >
                            <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl">
                                Umroh Mudah Bersama {tenant?.nama_travel || 'Travel Kami'}
                            </h1>
                            <p className="mt-6 max-w-3xl mx-auto text-xl text-gray-300">
                                Wujudkan impian ke Baitullah dengan bimbingan dan pelayanan terbaik dari agen profesional kami.
                            </p>
                        </motion.div>
                    </div>
                </div>

                {/* Profile Section */}
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-16 relative z-10">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className="bg-white rounded-2xl shadow-xl overflow-hidden"
                    >
                        <div className="p-8 sm:p-12 md:flex md:items-center md:justify-between">
                            <div className="flex items-center space-x-6">
                                <div className="flex-shrink-0 relative">
                                    <img
                                        className="h-32 w-32 rounded-full border-4 border-white shadow-lg object-cover"
                                        src={`https://ui-avatars.com/api/?name=${encodeURIComponent(agent.name)}&background=2563eb&color=fff&size=256`}
                                        alt={agent.name}
                                    />
                                    <div className="absolute bottom-0 right-0 bg-green-500 rounded-full p-1.5 border-4 border-white" title="Agen Resmi">
                                        <CheckCircle className="h-5 w-5 text-white" />
                                    </div>
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-blue-600 uppercase tracking-wide">
                                        Agen Resmi {tenant?.nama_travel}
                                    </p>
                                    <h2 className="mt-1 text-3xl font-bold text-gray-900">{agent.name}</h2>
                                    <div className="mt-2 flex items-center text-gray-500 space-x-4">
                                        <div className="flex items-center">
                                            <Star className="h-5 w-5 text-yellow-400 mr-1" />
                                            <span className="font-medium text-gray-700">4.9</span>
                                            <span className="ml-1 text-sm">(120+ Jamaah)</span>
                                        </div>
                                        <div className="flex items-center">
                                            <MapPin className="h-5 w-5 text-gray-400 mr-1" />
                                            <span>Indonesia</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="mt-8 md:mt-0">
                                <Link
                                    href={registerUrl}
                                    className="inline-flex items-center justify-center px-8 py-4 border border-transparent text-base font-medium rounded-full text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-md hover:shadow-lg transition-all duration-300 ease-in-out transform hover:-translate-y-1"
                                >
                                    Daftar Bersama Saya
                                    <ArrowRight className="ml-2 -mr-1 h-5 w-5" />
                                </Link>
                                <p className="mt-3 text-sm text-center text-gray-500">
                                    Pendaftaran Cepat & Aman
                                </p>
                            </div>
                        </div>

                        {/* Testimonial / Quote */}
                        <div className="bg-gray-50 px-8 py-6 border-t border-gray-100 flex items-start space-x-4">
                            <Quote className="h-8 w-8 text-blue-300 flex-shrink-0" />
                            <p className="text-gray-600 italic">
                                "Saya berkomitmen untuk mendampingi setiap langkah Anda menuju Tanah Suci. Dari persiapan hingga kepulangan, kenyamanan dan kekhusyukan ibadah Anda adalah prioritas utama saya."
                            </p>
                        </div>
                    </motion.div>
                </div>

                {/* Kenapa Memilih Kami */}
                <div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold text-gray-900">Keunggulan Mendaftar via {agent.name}</h2>
                        <p className="mt-4 text-lg text-gray-500">Nikmati berbagai kemudahan dan fasilitas eksklusif.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[
                            { title: 'Konsultasi 24/7', desc: 'Dapatkan pendampingan dan tanya jawab seputar ibadah kapan saja.' },
                            { title: 'Bantuan Dokumen', desc: 'Pengurusan paspor, visa, dan dokumen perjalanan dibantu penuh.' },
                            { title: 'Promo Khusus', desc: 'Akses diskon dan paket eksklusif yang hanya tersedia melalui agen.' }
                        ].map((item, index) => (
                            <motion.div 
                                key={index}
                                whileHover={{ y: -5 }}
                                className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100"
                            >
                                <div className="h-12 w-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center mb-4">
                                    <CheckCircle className="h-6 w-6" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-2">{item.title}</h3>
                                <p className="text-gray-600">{item.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>
        </>
    );
}
