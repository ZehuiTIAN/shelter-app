import Link from 'next/link'

export default function BackToHome() {
  return (
    <Link 
      href="/" 
      className="fixed top-4 left-4 px-4 py-2 bg-white/90 backdrop-blur-sm border border-slate-200 text-slate-600 rounded-lg text-sm font-medium hover:bg-slate-100 hover:text-slate-900 transition-all shadow-sm z-50"
    >
      ← 回到主页
    </Link>
  )
}