'use client'

import { useState, useEffect } from 'react'
import { supabase } from '../../utils/supabase.js'

export default function ProviderPage() {
  const [activeTab, setActiveTab] = useState<'mental' | 'physical'>('mental')
  const [bottles, setBottles] = useState<any[]>([])
  
  // 物理庇护表单状态
  const [shelterForm, setShelterForm] = useState({ name: '', address: '' })

  // 加载漂流瓶
  useEffect(() => {
    if (activeTab === 'mental') {
      const fetchBottles = async () => {
        // 仅显示未解决的瓶子
        const { data } = await supabase.from('bottles').select('*').eq('status', 'open').order('created_at', { ascending: false })
        if (data) setBottles(data)
      }
      fetchBottles()
    }
  }, [activeTab])

  // 响应漂流瓶
  const handleHelpBottle = async (bottleId: string) => {
    const contact = prompt("请输入您希望对方联系您的号码或微信号：")
    if (!contact) return

    const { data: { user } } = await supabase.auth.getUser()
    
    const { error } = await supabase.from('bottle_responses').insert([
      {
        bottle_id: bottleId,
        provider_id: user?.id,
        contact_info_shared: contact,
        message: "志愿者已接单"
      }
    ])

    if (!error) {
      alert("联系方式已发送给求助者！")
      // 可以在这里更新 bottle 状态为 solved，或者保留 open 允许多人帮助
    } else {
      alert("操作失败: " + error.message)
    }
  }

  // 注册物理庇护点
  const registerShelter = async () => {
    // 简单模拟：使用浏览器当前位置作为店铺位置
    navigator.geolocation.getCurrentPosition(async (position) => {
      const { latitude, longitude } = position.coords
      const { data: { user } } = await supabase.auth.getUser()

      const { error } = await supabase.from('shelters').insert([
        {
          provider_id: user?.id,
          name: shelterForm.name,
          address: shelterForm.address,
          latitude,
          longitude
        }
      ])

      if (!error) alert("庇护点注册成功！求助者现在可以看到您的位置。")
      else alert("注册失败: " + error.message)
    }, () => alert("需要获取位置权限才能注册庇护点"))
  }

  return (
    <main className="min-h-screen bg-slate-50 p-4">
      <div className="flex gap-4 mb-6">
        <button 
          onClick={() => setActiveTab('mental')}
          className={`flex-1 py-3 rounded-lg font-bold ${activeTab === 'mental' ? 'bg-blue-600 text-white' : 'bg-white text-slate-600'}`}
        >
          🧠 精神支持
        </button>
        <button 
          onClick={() => setActiveTab('physical')}
          className={`flex-1 py-3 rounded-lg font-bold ${activeTab === 'physical' ? 'bg-green-600 text-white' : 'bg-white text-slate-600'}`}
        >
          🏠 物理庇护
        </button>
      </div>

      {activeTab === 'mental' ? (
        <div className="space-y-4">
          {bottles.map(bottle => (
            <div key={bottle.id} className="bg-white p-5 rounded-xl shadow-sm">
              <p className="text-slate-800 mb-4 text-lg">"{bottle.content}"</p>
              <div className="flex justify-between items-center text-sm text-slate-400">
                <span>{new Date(bottle.created_at).toLocaleDateString()}</span>
                <button 
                  onClick={() => handleHelpBottle(bottle.id)}
                  className="bg-blue-100 text-blue-700 px-4 py-2 rounded-lg font-semibold hover:bg-blue-200"
                >
                  提供帮助 (发送联系方式)
                </button>
              </div>
            </div>
          ))}
          {bottles.length === 0 && <p className="text-center text-slate-400 mt-10">暂时没有新的漂流瓶。</p>}
        </div>
      ) : (
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <h2 className="text-xl font-bold mb-4 text-slate-800">注册庇护点</h2>
          <p className="text-sm text-slate-500 mb-4">我们将使用您当前的 GPS 位置作为庇护点坐标。</p>
          
          <input 
            className="w-full p-3 border border-slate-200 rounded-lg mb-3"
            placeholder="场所名称 (如: XX便利店)"
            value={shelterForm.name}
            onChange={e => setShelterForm({...shelterForm, name: e.target.value})}
          />
          <input 
            className="w-full p-3 border border-slate-200 rounded-lg mb-6"
            placeholder="显示地址 (如: XX路123号)"
            value={shelterForm.address}
            onChange={e => setShelterForm({...shelterForm, address: e.target.value})}
          />
          <button 
            onClick={registerShelter}
            className="w-full bg-green-600 text-white py-3 rounded-lg font-bold"
          >
            📍 确认上传当前位置
          </button>
        </div>
      )}
    </main>
  )
}