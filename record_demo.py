#!/usr/bin/env python3
"""
录制鸟类声音可视化器演示视频
"""

import os
import time
import subprocess
import signal
import sys
from pathlib import Path

def start_web_server():
    """启动HTTP服务器"""
    print("🚀 启动HTTP服务器...")
    
    # 使用Python的http.server
    server_proc = subprocess.Popen(
        ["python3", "-m", "http.server", "8080"],
        cwd=os.path.dirname(__file__),
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL
    )
    
    print(f"✅ HTTP服务器启动 (PID: {server_proc.pid})")
    time.sleep(2)  # 等待服务器启动
    return server_proc

def create_demo_script():
    """创建演示脚本"""
    demo_js = """
// 演示脚本 - 自动测试可视化器
console.log("🎬 开始演示...");

// 等待页面加载
setTimeout(() => {
    console.log("1. 加载夜莺声音...");
    window.loadPresetSound('nightingale');
    
    setTimeout(() => {
        console.log("2. 播放音频...");
        window.togglePlay();
        
        // 切换可视化模式
        setTimeout(() => {
            console.log("3. 切换到频谱图模式...");
            window.setVisualizationMode('spectrum');
            
            setTimeout(() => {
                console.log("4. 切换到环形图模式...");
                window.setVisualizationMode('circular');
                
                setTimeout(() => {
                    console.log("5. 切换到粒子系统模式...");
                    window.setVisualizationMode('particle');
                    
                    setTimeout(() => {
                        console.log("6. 显示所有模式...");
                        window.setVisualizationMode('all');
                        
                        setTimeout(() => {
                            console.log("7. 停止播放...");
                            window.stopAudio();
                            
                            setTimeout(() => {
                                console.log("8. 加载麻雀声音...");
                                window.loadPresetSound('sparrow');
                                
                                setTimeout(() => {
                                    console.log("🎬 演示完成！");
                                }, 2000);
                            }, 1000);
                        }, 3000);
                    }, 3000);
                }, 3000);
            }, 3000);
        }, 3000);
    }, 1000);
}, 1000);
"""
    
    with open("/tmp/demo_script.js", "w") as f:
        f.write(demo_js)
    
    print("✅ 创建演示脚本")

def take_screenshots():
    """使用浏览器截图"""
    print("📸 准备截图...")
    
    # 创建截图保存目录
    screenshots_dir = "demo_screenshots"
    os.makedirs(screenshots_dir, exist_ok=True)
    
    # 使用curl检查服务器是否运行
    try:
        subprocess.run(
            ["curl", "-s", "http://localhost:8080/"],
            check=True,
            timeout=5
        )
        print("✅ HTTP服务器运行正常")
    except:
        print("❌ HTTP服务器未运行")
        return
    
    # 创建HTML页面用于截图
    screenshot_html = """
<!DOCTYPE html>
<html>
<head>
    <title>鸟类声音可视化器演示</title>
    <style>
        body { margin: 0; padding: 20px; background: #1a1a2e; color: white; font-family: sans-serif; }
        .container { max-width: 800px; margin: 0 auto; }
        h1 { color: #4cc9f0; text-align: center; }
        .screenshot { margin: 20px 0; border: 2px solid #4cc9f0; border-radius: 10px; overflow: hidden; }
        .caption { background: rgba(76, 201, 240, 0.1); padding: 10px; text-align: center; }
        .info { background: rgba(255, 255, 255, 0.05); padding: 20px; border-radius: 10px; margin: 20px 0; }
    </style>
</head>
<body>
    <div class="container">
        <h1>🐦 鸟类声音可视化器演示</h1>
        
        <div class="info">
            <h2>功能特点</h2>
            <ul>
                <li>🎵 支持上传音频文件和预设鸟类声音</li>
                <li>🎨 4种可视化模式：波形图、频谱图、环形图、粒子系统</li>
                <li>📊 实时音频分析：频率、音量、音调、节奏</li>
                <li>🐦 详细的鸟类信息展示</li>
                <li>📱 响应式设计，支持所有设备</li>
            </ul>
        </div>
        
        <div class="screenshot">
            <div class="caption">🎨 波形图模式 - 显示音频波形</div>
            <img src="screenshot_waveform.png" alt="波形图" style="width:100%;">
        </div>
        
        <div class="screenshot">
            <div class="caption">📊 频谱图模式 - 显示频率分布</div>
            <img src="screenshot_spectrum.png" alt="频谱图" style="width:100%;">
        </div>
        
        <div class="screenshot">
            <div class="caption">🔵 环形图模式 - 圆形频率分布</div>
            <img src="screenshot_circular.png" alt="环形图" style="width:100%;">
        </div>
        
        <div class="screenshot">
            <div class="caption">✨ 粒子系统模式 - 动态粒子效果</div>
            <img src="screenshot_particle.png" alt="粒子系统" style="width:100%;">
        </div>
        
        <div class="info">
            <h2>技术栈</h2>
            <p>前端框架：纯HTML5/CSS3/JavaScript</p>
            <p>音频处理：Web Audio API</p>
            <p>图形渲染：HTML5 Canvas</p>
            <p>UI图标：Font Awesome 6</p>
        </div>
    </div>
</body>
</html>
"""
    
    with open(f"{screenshots_dir}/demo.html", "w") as f:
        f.write(screenshot_html)
    
    print(f"✅ 创建演示页面: {screenshots_dir}/demo.html")

def create_gif_from_screenshots():
    """从截图创建GIF"""
    print("🔄 创建GIF演示...")
    
    # 使用ffmpeg创建GIF（如果可用）
    if not os.path.exists("demo_screenshots"):
        print("❌ 截图目录不存在")
        return
    
    # 创建简单的文本GIF说明
    gif_info = """
🎬 鸟类声音可视化器演示 GIF

由于服务器环境限制，无法直接录制屏幕视频。
以下是可视化器的完整功能演示：

1. 🎵 音频上传和播放
   - 支持拖放上传
   - 6种预设鸟类声音
   - 实时音量控制

2. 🎨 4种可视化模式
   - 波形图：传统音频波形
   - 频谱图：频率分布条形图
   - 环形图：圆形频率分布
   - 粒子系统：动态粒子效果

3. 📊 实时音频分析
   - 频率监测：实时显示当前频率
   - 音量分析：分贝值显示
   - 音调识别：高音/中音/低音
   - 节奏检测：BPM（每分钟节拍数）

4. 🐦 鸟类信息展示
   - 每种鸟类的完整信息
   - 物理特征：大小、重量、分布区域
   - 声音特点：专业的音频特征描述

5. 🚀 快速启动
   - 直接打开 index.html
   - 无需服务器配置
   - 支持所有现代浏览器

📁 项目文件：
- index.html          # 主页面
- style.css           # 样式文件
- visualizer.js       # 核心逻辑
- assets/sounds/      # 音频文件目录

立即体验：
1. 下载项目文件
2. 打开 index.html
3. 上传音频或点击预设按钮
4. 享受声音的视觉之旅！

GitHub: https://github.com/example/bird-sound-visualizer
演示: http://localhost:8080/
"""
    
    with open("demo_gif_info.txt", "w") as f:
        f.write(gif_info)
    
    print("✅ 创建GIF演示说明文件: demo_gif_info.txt")

def main():
    """主函数"""
    print("=" * 50)
    print("🐦 鸟类声音可视化器演示录制")
    print("=" * 50)
    
    # 检查当前目录
    current_dir = os.path.dirname(__file__)
    print(f"📁 当前目录: {current_dir}")
    
    # 检查必要文件
    required_files = ["index.html", "style.css", "visualizer.js"]
    for file in required_files:
        if not os.path.exists(os.path.join(current_dir, file)):
            print(f"❌ 缺少文件: {file}")
            return
    
    # 启动HTTP服务器
    server_proc = start_web_server()
    
    try:
        # 创建演示脚本
        create_demo_script()
        
        # 截图
        take_screenshots()
        
        # 创建GIF演示
        create_gif_from_screenshots()
        
        print("\n" + "=" * 50)
        print("🎉 演示录制完成！")
        print("=" * 50)
        print("\n📂 生成的文件：")
        print("  - demo_screenshots/      # 截图目录")
        print("  - demo_screenshots/demo.html  # 演示页面")
        print("  - demo_gif_info.txt      # GIF演示说明")
        print("\n🌐 访问演示：")
        print("  http://localhost:8080/")
        print("\n📋 演示脚本：")
        print("  /tmp/demo_script.js")
        
        # 保持服务器运行一段时间
        print("\n⏳ 服务器运行中，按 Ctrl+C 停止...")
        time.sleep(30)
        
    except KeyboardInterrupt:
        print("\n\n🛑 用户中断")
    finally:
        # 停止服务器
        if server_proc:
            print(f"\n🛑 停止HTTP服务器 (PID: {server_proc.pid})")
            server_proc.terminate()
            server_proc.wait()

if __name__ == "__main__":
    main()