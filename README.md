<div align="center">

# 🛡️ Shelter App | 庇护所卫士

[English](#-english) | [简体中文](#-简体中文)

![Vercel](https://img.shields.io/badge/Deployed_on-Vercel-black?logo=vercel)
![Supabase](https://img.shields.io/badge/Backend-Supabase-green?logo=supabase)
![AI Powered](https://img.shields.io/badge/AI-Gemini_Vibe_Coding-blue?logo=google-gemini)

</div>

---

<a name="-english"></a>
## 🇬🇧 English

### 📖 Introduction

**Shelter App** is a registered sanctuary platform designed to connect individuals facing domestic violence with immediate help. We believe in the power of community—where technology can weave a safety net for those in crisis.

This platform serves two main roles:
* **Seekers:** Can send anonymous "Drift Bottles" for help, find nearby safe shelters (physical businesses or verified individuals), or join remote mental support groups.
* **Helpers:** Can register their location as a "Safe Spot" or provide remote psychological comfort.

### 💡 Origin & "Vibe Coding"

This project is a demo created during a **Women's Hackathon** from **She Code Lab**.

It is an experiment in **"Gemini Vibe Coding"**:
* **90% of the code** was generated using **Google Gemini**.
* The architecture (Next.js + Supabase) was built in under 24 hours by a female developer and her AI pair programmer.

**⚠️ Note:** This is an MVP (Minimum Viable Product). Features are still in the "Proof of Concept" stage. We welcome everyone to contribute and help us turn this vibe into a lifeline.

### ✨ Key Features

1.  **Mental & Physical Shelter:**
    * **Drift Bottle:** Asynchronous help requests.
2.  **Physical Shelter:**
    * **Safe Map:** Locate verified safe spots nearby.
3.  **Privacy First:** Exact locations of Seekers are masked until an SOS is actively triggered.

### 🛠️ Tech Stack

* **Frontend:** [Next.js 14 (App Router)](https://nextjs.org/), [Tailwind CSS](https://tailwindcss.com/)
* **Backend & Database:** [Supabase](https://supabase.com/) (Auth, PostgreSQL, Realtime, RLS Security)
* **Deployment:** [Vercel](https://vercel.com/)

### 🚀 Getting Started

1.  **Clone the repo:**
    ```bash
    git clone [https://github.com/ZehuiTIAN/shelter-app](https://github.com/ZehuiTIAN/shelter-app)
    cd shelter-app
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Setup Environment Variables:**
    Create a `.env.local` file and add your Supabase credentials:
    ```env
    NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
    NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
    ```

4.  **Run locally:**
    ```bash
    npm run dev
    ```

### 🤝 Contributing

We are looking for help with:
* Improving the map interface UX.
* Refining the "Panic Mode" logic.
* Adding more robust verification for Helpers.

Please fork the repository and create a Pull Request. Let's code for good!

---

<a name="-简体中文"></a>
## 🇨🇳 简体中文

### 📖 项目介绍

**Shelter App (庇护所)** 是一个旨在对抗暴力的互助平台。我们希望通过技术编织一张安全网，连接需要帮助的人与愿意提供援手的人。

平台包含两个可切换的核心角色：
* **求助者 (Seeker):** 可以发送匿名的求助信息，寻找附近的精神庇护（远程小组）或物理庇护（注册的安全商家/个人）。
* **帮助者 (Helper):** 可以注册成为安全点，或提供远程心理疏导。

### 💡 初衷与 "Vibe Coding"

本项目是 **She Code Lab 女性黑客松** 的 Demo 作品。

这是一次 **"Gemini Vibe Coding"** 的实验：
* **90% 的代码** 由 **Google Gemini** 辅助生成。

**⚠️ 注意：** 目前项目处于 MVP（最小可行性产品）阶段，很多功能尚不完善。这是一个概念验证，非常欢迎社区伙伴加入共创，完善这个也许能挽救生命的小工具。

### ✨ 核心功能

1.  **精神庇护：**
    * **求助信息：** 发出求助信息，帮助者看到后可回复联系方式。
2.  **物理庇护：**
    * **安全地图：** 基于地理位置寻找附近的注册庇护点。
3.  **隐私优先：** 求助者的精确位置仅在主动触发 SOS 时才会对匹配的志愿者通过加密通道共享。

### 🛠️ 技术栈

* **前端框架：** [Next.js 14 (App Router)](https://nextjs.org/)
* **后端服务：** [Supabase](https://supabase.com/)
* **部署上线：** [Vercel](https://vercel.com/)

### 🚀 如何运行

1.  **克隆仓库：**
    ```bash
    git clone [https://github.com/ZehuiTIAN/shelter-app](https://github.com/ZehuiTIAN/shelter-app)
    cd shelter-app
    ```

2.  **安装依赖：**
    ```bash
    npm install
    ```

3.  **配置环境变量：**
    在根目录创建 `.env.local` 文件，填入你的 Supabase 凭证：
    ```env
    NEXT_PUBLIC_SUPABASE_URL=你的项目URL
    NEXT_PUBLIC_SUPABASE_ANON_KEY=你的AnonKey
    ```

4.  **本地启动：**
    ```bash
    npm run dev
    ```

### 🤝 欢迎共创

如果你也是一名女性开发者，或者你关注反家暴议题，欢迎通过 Issue 或 Pull Request 参与进来。目前仍然需要：
* 优化地图交互体验。
* 完善“伪装模式”的 UI 设计。
* 为帮助者设计更完善的验证流程。

让我们一起用代码编织力量。
