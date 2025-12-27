'use client' // 必须加这行，因为我们要用useEffect

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '../utils/supabase.js' // 确保这个路径对应你刚才建文件的位置

export default function Home() {
  const [connectionStatus, setConnectionStatus] = useState('Checking...')
  const [user, setUser] = useState<any>(null)

  // 1. 测试连接的逻辑
  useEffect(() => {
    async function checkSupabase() {
      // 尝试查询 profiles 表，只要不报错就算连通
      const { data, error } = await supabase.from('profiles').select('id').limit(1)
      
      if (error) {
        console.error("连接失败:", error)
        setConnectionStatus('🔴 数据库未连接 (看控制台报错)')
      } else {
        setConnectionStatus('🟢 数据库已连接')
      }
    }
    checkSupabase()

    // 检查当前登录用户
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user)
    })
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    setUser(null)
    alert("已退出登录")
  }

  // 2. 页面 UI 渲染
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 bg-slate-50">
      
      {/* 状态栏 (测试用) */}
      <div className="absolute top-4 right-4 text-sm font-mono">
        {connectionStatus}
      </div>

      <h1 className="text-4xl font-bold mb-8 text-slate-800">Shelter Guard</h1>
      <p className="mb-12 text-slate-500 text-center max-w-md">
        安全、隐秘的家暴庇护网络。您的位置只有在发出求助时才会被共享。
      </p>

      {!user ? (
        <div className="w-full max-w-md space-y-4">
          <Link 
            href="/auth"
            className="block w-full py-4 bg-slate-800 text-white text-center rounded-xl font-bold text-xl hover:bg-slate-900 transition-all"
          >
            登录 / 注册
          </Link>
          <p className="text-center text-sm text-slate-400">请先登录以使用功能</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 w-full max-w-md">
          <div className="text-center text-slate-600 mb-2">
            当前登录: {user.email}
          </div>
          
          {/* 求助者按钮 */}
          <Link 
            href="/seeker"
            className="h-32 rounded-xl bg-red-600 hover:bg-red-700 text-white text-2xl font-bold shadow-lg transition-all flex flex-col items-center justify-center gap-2"
          >
            <span>🆘 我需要帮助</span>
            <span className="text-sm font-normal opacity-90">寻找附近的精神/物理庇护</span>
          </Link>

          {/* 志愿者按钮 */}
          <Link 
            href="/provider"
            className="h-20 rounded-xl bg-white border-2 border-slate-200 hover:border-slate-400 text-slate-700 text-xl font-bold shadow-sm transition-all flex items-center justify-center"
          >
            🤝 我想提供帮助
          </Link>

          <button onClick={handleLogout} className="text-slate-400 text-sm hover:text-slate-600 mt-4">
            退出登录
          </button>
        </div>
      )}

      {/* 紧急逃生按钮 (演示用) */}
      <div className="fixed bottom-4 text-xs text-gray-400">
        按 ESC 键快速退出
      </div>
    </main>
  )
}