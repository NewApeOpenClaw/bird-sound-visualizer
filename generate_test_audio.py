#!/usr/bin/env python3
"""
生成测试音频文件（模拟鸟类声音）
"""

import numpy as np
import soundfile as sf
import os

def generate_bird_sound(freq=1000, duration=3, sample_rate=44100, filename="bird_test.wav"):
    """
    生成鸟类声音测试音频
    freq: 频率 (Hz)
    duration: 时长 (秒)
    """
    # 生成时间轴
    t = np.linspace(0, duration, int(sample_rate * duration), False)
    
    # 生成正弦波（基础频率）
    tone = np.sin(freq * t * 2 * np.pi)
    
    # 添加一些频率变化（模拟鸟鸣）
    freq_variation = np.sin(5 * t * 2 * np.pi) * 100  # 频率波动
    tone_variation = np.sin((freq + freq_variation) * t * 2 * np.pi)
    
    # 合并两个声音
    audio = 0.7 * tone + 0.3 * tone_variation
    
    # 添加淡入淡出效果
    fade_in = np.linspace(0, 1, int(sample_rate * 0.1))
    fade_out = np.linspace(1, 0, int(sample_rate * 0.2))
    audio[:len(fade_in)] *= fade_in
    audio[-len(fade_out):] *= fade_out
    
    # 确保音频在合理范围内
    audio = np.clip(audio, -1, 1)
    
    # 保存为WAV文件
    sf.write(filename, audio, sample_rate)
    print(f"✅ 生成音频文件: {filename} (频率: {freq}Hz, 时长: {duration}秒)")
    return filename

def generate_multiple_bird_sounds():
    """生成多种鸟类声音"""
    birds = {
        "nightingale": {"freq": 1200, "duration": 4},  # 夜莺 - 高频率
        "sparrow": {"freq": 800, "duration": 2},       # 麻雀 - 中等频率
        "eagle": {"freq": 400, "duration": 3},         # 老鹰 - 低频率
        "owl": {"freq": 300, "duration": 5},           # 猫头鹰 - 很低频率
        "robin": {"freq": 1000, "duration": 3},        # 知更鸟 - 中等高频率
        "parrot": {"freq": 600, "duration": 4}         # 鹦鹉 - 中低频率
    }
    
    generated_files = []
    
    # 创建assets目录
    os.makedirs("assets/sounds", exist_ok=True)
    
    for bird_name, params in birds.items():
        filename = f"assets/sounds/{bird_name}.wav"
        generate_bird_sound(
            freq=params["freq"],
            duration=params["duration"],
            filename=filename
        )
        generated_files.append(filename)
    
    return generated_files

def create_mixed_bird_sound():
    """创建混合的鸟类声音"""
    sample_rate = 44100
    duration = 10
    
    # 生成时间轴
    t = np.linspace(0, duration, int(sample_rate * duration), False)
    
    # 创建空音频
    audio = np.zeros_like(t)
    
    # 添加多个鸟类声音
    bird_freqs = [300, 500, 800, 1200, 1800]  # 不同频率
    
    for i, freq in enumerate(bird_freqs):
        # 每个声音在不同时间开始
        start_time = i * 1.5
        if start_time < duration:
            # 计算这个声音的时间段
            start_idx = int(start_time * sample_rate)
            end_idx = min(start_idx + int(2.5 * sample_rate), len(t))
            
            if start_idx < end_idx:
                # 生成这个时间段的声音
                t_segment = t[start_idx:end_idx] - start_time
                bird_sound = np.sin(freq * t_segment * 2 * np.pi)
                
                # 添加频率变化
                freq_variation = np.sin(3 * t_segment * 2 * np.pi) * 50
                bird_sound += 0.3 * np.sin((freq + freq_variation) * t_segment * 2 * np.pi)
                
                # 添加淡入淡出
                fade_duration = int(0.2 * sample_rate)
                fade_in = np.linspace(0, 1, fade_duration)
                fade_out = np.linspace(1, 0, fade_duration)
                
                if len(bird_sound) > 2 * fade_duration:
                    bird_sound[:fade_duration] *= fade_in
                    bird_sound[-fade_duration:] *= fade_out
                
                # 添加到主音频
                audio[start_idx:end_idx] += 0.3 * bird_sound
    
    # 归一化
    audio = np.clip(audio, -1, 1)
    
    # 保存
    filename = "assets/sounds/mixed_birds.wav"
    sf.write(filename, audio, sample_rate)
    print(f"✅ 生成混合鸟类声音: {filename}")
    return filename

if __name__ == "__main__":
    print("🎵 开始生成测试音频文件...")
    
    # 生成单个鸟类声音
    generate_bird_sound(freq=1000, duration=3, filename="test_bird.wav")
    
    # 生成多种鸟类声音
    generated = generate_multiple_bird_sounds()
    print(f"✅ 生成 {len(generated)} 种鸟类声音")
    
    # 生成混合声音
    create_mixed_bird_sound()
    
    print("\n📁 生成的音频文件:")
    if os.path.exists("assets/sounds"):
        for file in os.listdir("assets/sounds"):
            if file.endswith(".wav"):
                filepath = os.path.join("assets/sounds", file)
                size = os.path.getsize(filepath)
                print(f"  - {file} ({size:,} bytes)")
    
    print("\n🎉 音频生成完成！")