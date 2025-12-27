'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../utils/supabase.js'

export default function AuthPage() {
  const router = useRouter()
  const [isLogin, setIsLogin] = useState(true)
  const [loading, setLoading] = useState(false)
  
  // 表单状态
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState<'seeker' | 'provider'>('seeker')
  const [subRole, setSubRole] = useState<'mental' | 'physical'>('mental')

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    if (isLogin) {
      // 登录逻辑
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      if (error) {
        alert('登录失败: ' + error.message)
      } else {
        // 登录成功，获取用户角色并跳转
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', data.user.id)
          .single()
        
        if (profile?.role === 'seeker') router.push('/seeker')
        else if (profile?.role === 'provider') router.push('/provider')
        else router.push('/')
      }
    } else {
      // 注册逻辑
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          // 将角色信息存入 user_metadata，触发器会自动写入 profiles 表
          data: {
            role,
            sub_role: role === 'provider' ? subRole : null
          }
        }
      })
      if (error) {
        alert('注册失败: ' + error.message)
      } else {
        if (data.session) {
          // 注册并自动登录成功 (无需邮箱验证)
          if (role === 'seeker') router.push('/seeker')
          else if (role === 'provider') router.push('/provider')
        } else {
          // 需要邮箱验证
          alert('注册成功！请检查邮箱进行验证。')
          setIsLogin(true)
        }
      }
    }
    setLoading(false)
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8">
        <h1 className="text-2xl font-bold text-center mb-6 text-slate-800">
          {isLogin ? '欢迎回来' : '加入 Shelter Guard'}
        </h1>

        <form onSubmit={handleAuth} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">邮箱</label>
            <input
              type="email"
              required
              className="w-full p-2 border border-slate-300 rounded-md"
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">密码</label>
            <input
              type="password"
              required
              className="w-full p-2 border border-slate-300 rounded-md"
              value={password}
              onChange={e => setPassword(e.target.value)}
            />
          </div>

          {/* 仅注册时显示角色选择 */}
          {!isLogin && (
            <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
              <label className="block text-sm font-medium text-slate-700 mb-2">我是...</label>
              <div className="flex gap-4 mb-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" checked={role === 'seeker'} onChange={() => setRole('seeker')} />
                  <span className="text-slate-800">求助者</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" checked={role === 'provider'} onChange={() => setRole('provider')} />
                  <span className="text-slate-800">提供帮助者</span>
                </label>
              </div>

              {role === 'provider' && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">我想提供...</label>
                  <select 
                    className="w-full p-2 border border-slate-300 rounded-md"
                    value={subRole}
                    onChange={(e) => setSubRole(e.target.value as any)}
                  >
                    <option value="mental">🧠 精神支持 (漂流瓶)</option>
                    <option value="physical">🏠 物理庇护 (提供场所)</option>
                  </select>
                </div>
              )}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 rounded-md font-bold hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {loading ? '处理中...' : (isLogin ? '登录' : '注册')}
          </button>
        </form>

        <div className="mt-4 text-center">
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-sm text-blue-600 hover:underline"
          >
            {isLogin ? '没有账号？去注册' : '已有账号？去登录'}
          </button>
        </div>
      </div>
    </main>
  )
}