'use client'

import { useState, useEffect } from 'react'
import { supabase } from '../../utils/supabase.js'

import BackToHome from '../../components/BackToHome'

export default function SeekerPage() {
  const [message, setMessage] = useState('')
  const [sending, setSending] = useState(false)
  const [shelters, setShelters] = useState<any[]>([])
  const [location, setLocation] = useState<{lat: number, lng: number} | null>(null)
  const [myBottles, setMyBottles] = useState<any[]>([])

  // 获取我的漂流瓶及回复
  const fetchMyBottles = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data, error } = await supabase
      .from('bottles')
      .select(`
        *,
        bottle_responses (
          id,
          contact_info_shared,
          message,
          created_at
        )
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
    
    if (data) setMyBottles(data)
    if (error) {
      console.error('获取求助信箱失败:', error)
    } else if (data) {
      setMyBottles(data)
    }
  }

  // 1. 发送漂流瓶逻辑
  const sendBottle = async () => {
    if (!message.trim()) return
    setSending(true)
    
    // 获取当前用户 (实际项目中需要处理未登录情况)
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      alert("请先登录后再发送求助信息")
      setSending(false)
      return
    }

    const { error } = await supabase.from('bottles').insert([
      { 
        content: message,
        user_id: user.id 
      }
    ])

    if (error) {
      // 自动修复逻辑：如果是因为缺少 profile 导致的外键错误
      if (error.message.includes('foreign key constraint')) {
        // 尝试补充创建 profile
        const { error: profileError } = await supabase.from('profiles').insert([{ id: user.id }])
        
        if (!profileError) {
          // 修复成功，重试发送
          const { error: retryError } = await supabase.from('bottles').insert([{ content: message, user_id: user.id }])
          if (!retryError) {
            alert('信息已发出。')
            setMessage('')
            setSending(false)
            fetchMyBottles()
            return
          }
        }
      }
      alert('发送失败: ' + error.message)
    } else {
      alert('漂流瓶已发出，请留意收件箱或通知。')
      setMessage('')
      fetchMyBottles()
    }
    setSending(false)
  }

  // 2. 获取位置并查找附近庇护所
  useEffect(() => {
    fetchMyBottles()

    // 提取获取庇护所数据的逻辑，方便复用
    const fetchShelters = async (lat: number, lng: number) => {
      // 从 Supabase 获取所有庇护所
      const { data } = await supabase.from('shelters').select('*')
      
      if (data) {
        // 计算距离并排序
        const sorted = data.map(shelter => {
          const dist = getDistanceFromLatLonInKm(lat, lng, shelter.latitude, shelter.longitude)
          return { ...shelter, distance: dist }
        }).sort((a, b) => a.distance - b.distance)
        
        setShelters(sorted)
      }
    }

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(async (position) => {
        const { latitude, longitude } = position.coords
        setLocation({ lat: latitude, lng: longitude })
        await fetchShelters(latitude, longitude)
      }, async (err) => {
        alert("无法获取您的当前位置，将显示默认位置（北京）附近的庇护所。")
        
        // 设置默认位置 (例如: 北京天安门)
        const defaultLat = 39.9042
        const defaultLng = 116.4074
        setLocation({ lat: defaultLat, lng: defaultLng })
        await fetchShelters(defaultLat, defaultLng)
      })
    }
  }, [])

  return (
    <main className="min-h-screen bg-slate-50 p-4 pb-20">
      <BackToHome />
      <h1 className="text-2xl font-bold text-slate-800 mb-6">寻求帮助</h1>

      {/* 模块 A: 漂流瓶 */}
      <section className="bg-white p-4 rounded-xl shadow-sm mb-6">
        <h2 className="text-lg font-semibold mb-2 text-blue-600">🌊 发送求助庇护消息</h2>
        <p className="text-sm text-slate-500 mb-4">写下你的困境，会有能提供庇护的志愿者看到并联系你。</p>
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
          {sending ? '发送中...' : '发送消息至房间'}
        </button>
      </section>

      {/* 模块 C: 我的求助信箱 (显示回复) */}
      <section className="bg-white p-4 rounded-xl shadow-sm mb-6">
        <h2 className="text-lg font-semibold mb-4 text-slate-800">📬 我的求助信箱</h2>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-slate-800">📬 我的求助信箱</h2>
          <button 
            onClick={fetchMyBottles}
            className="text-sm px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg transition-colors"
          >
            🔄 刷新消息
          </button>
        </div>
        {myBottles.length === 0 ? (
          <p className="text-slate-400 text-sm">暂无求助记录</p>
        ) : (
          <div className="space-y-4">
            {myBottles.map(bottle => (
              <div key={bottle.id} className="border-b border-slate-100 pb-4 last:border-0">
                <p className="text-slate-600 mb-2 text-sm bg-slate-50 p-2 rounded">"{bottle.content}"</p>
                
                {bottle.bottle_responses && bottle.bottle_responses.length > 0 ? (
                  <div className="space-y-2 mt-2 pl-4 border-l-2 border-blue-200">
                    {bottle.bottle_responses.map((res: any) => (
                      <div key={res.id} className="text-sm">
                        <p className="text-green-600 font-bold">志愿者回应:</p>
                        <p className="text-slate-800">{res.message}</p>
                        <p className="text-blue-600 font-mono mt-1 select-all bg-blue-50 inline-block px-2 py-1 rounded">
                          联系方式: {res.contact_info_shared}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 mt-1">等待志愿者回应...</p>
                )}
              </div>
            ))}
          </div>
        )}
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