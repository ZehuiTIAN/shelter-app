'use client'

import { useState, useEffect } from 'react'
import { supabase } from '../../utils/supabase.js'

import BackToHome from '../../components/BackToHome'


export default function SeekerPage() {
  const [message, setMessage] = useState('')
  const [sending, setSending] = useState(false)
  const [shelters, setShelters] = useState<any[]>([])
  const [location, setLocation] = useState<{lat: number, lng: number} | null>(null)

  // 1. 发送漂流瓶逻辑
  const sendBottle = async () => {
    if (!message.trim()) return
    setSending(true)
    
    // 获取当前用户 (实际项目中需要处理未登录情况)
    const { data: { user } } = await supabase.auth.getUser()
    
    const { error } = await supabase.from('bottles').insert([
      { 
        content: message,
        user_id: user?.id // 如果未登录，这里可能需要允许匿名或提示登录
      }
    ])

    if (error) {
      alert('发送失败: ' + error.message)
    } else {
      alert('漂流瓶已发出，请留意收件箱或通知。')
      setMessage('')
    }
    setSending(false)
  }

  // 2. 获取位置并查找附近庇护所
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(async (position) => {
        const { latitude, longitude } = position.coords
        setLocation({ lat: latitude, lng: longitude })

        // 从 Supabase 获取所有庇护所 (生产环境应使用 PostGIS 进行数据库端筛选)
        const { data } = await supabase.from('shelters').select('*')
        
        if (data) {
          // 简单的客户端距离计算 (单位: km)
          const sorted = data.map(shelter => {
            const dist = getDistanceFromLatLonInKm(latitude, longitude, shelter.latitude, shelter.longitude)
            return { ...shelter, distance: dist }
          }).sort((a, b) => a.distance - b.distance)
          
          setShelters(sorted)
        }
      }, (err) => {
        console.error("无法获取位置", err)
      })
    }
  }, [])

  return (
    <main className="min-h-screen bg-slate-50 p-4 pb-20">
      <BackToHome />
      <h1 className="text-2xl font-bold text-slate-800 mb-6">寻求帮助</h1>

      {/* 模块 A: 漂流瓶 */}
      <section className="bg-white p-4 rounded-xl shadow-sm mb-6">
        <h2 className="text-lg font-semibold mb-2 text-blue-600">🌊 发送求助漂流瓶</h2>
        <p className="text-sm text-slate-500 mb-4">写下你的困境，会有提供精神支持的志愿者看到并联系你。</p>
        <textarea 
          className="w-full p-3 border border-slate-200 rounded-lg mb-3 text-slate-800"
          rows={4}
          placeholder="我感到很害怕..."
          value={message}
          onChange={e => setMessage(e.target.value)}
        />
        <button 
          onClick={sendBottle}
          disabled={sending}
          className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold disabled:opacity-50"
        >
          {sending ? '发送中...' : '扔出漂流瓶'}
        </button>
      </section>

      {/* 模块 B: 附近庇护所 */}
      <section>
        <h2 className="text-lg font-semibold mb-4 text-slate-800">📍 附近的物理庇护点</h2>
        {!location && <div className="text-slate-500 text-sm">正在获取您的定位...</div>}
        
        <div className="space-y-3">
          {shelters.map(shelter => (
            <div key={shelter.id} className="bg-white p-4 rounded-xl shadow-sm border-l-4 border-green-500">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-bold text-slate-800">{shelter.name}</h3>
                  <p className="text-sm text-slate-500">{shelter.address}</p>
                  <p className="text-xs text-slate-400 mt-1">距离: {shelter.distance.toFixed(1)} km</p>
                </div>
                <a 
                  href={`https://www.google.com/maps/search/?api=1&query=${shelter.latitude},${shelter.longitude}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-slate-100 text-slate-600 px-3 py-1 rounded text-sm"
                >
                  导航
                </a>
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  )
}

// 辅助函数：计算两点距离 (Haversine formula)
function getDistanceFromLatLonInKm(lat1: number, lon1: number, lat2: number, lon2: number) {
  var R = 6371; // Radius of the earth in km
  var dLat = deg2rad(lat2-lat1);  var dLon = deg2rad(lon2-lon1); 
  var a = Math.sin(dLat/2) * Math.sin(dLat/2) + Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * Math.sin(dLon/2) * Math.sin(dLon/2); 
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
  return R * c;
}
function deg2rad(deg: number) { return deg * (Math.PI/180) }