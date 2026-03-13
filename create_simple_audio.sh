#!/bin/bash
# 创建简单的测试音频文件

echo "🎵 创建测试音频文件..."

# 创建目录
mkdir -p assets/sounds

# 方法1: 使用sox创建简单的音频文件
if command -v sox &> /dev/null; then
    echo "✅ 使用sox创建音频文件..."
    
    # 夜莺声音 (高频率)
    sox -n assets/sounds/nightingale.wav synth 3 sine 1200 fade 0.1 0 0.1
    echo "✅ 创建: assets/sounds/nightingale.wav"
    
    # 麻雀声音 (中等频率)
    sox -n assets/sounds/sparrow.wav synth 2 sine 800 fade 0.05 0 0.05
    echo "✅ 创建: assets/sounds/sparrow.wav"
    
    # 老鹰声音 (低频率)
    sox -n assets/sounds/eagle.wav synth 3 sine 400 fade 0.1 0 0.1
    echo "✅ 创建: assets/sounds/eagle.wav"
    
    # 猫头鹰声音 (很低频率)
    sox -n assets/sounds/owl.wav synth 5 sine 300 fade 0.2 0 0.2
    echo "✅ 创建: assets/sounds/owl.wav"
    
else
    # 方法2: 使用ffmpeg
    if command -v ffmpeg &> /dev/null; then
        echo "✅ 使用ffmpeg创建音频文件..."
        
        # 创建测试音频
        ffmpeg -f lavfi -i "sine=frequency=1000:duration=3" assets/sounds/test.wav 2>/dev/null
        echo "✅ 创建: assets/sounds/test.wav"
        
    else
        # 方法3: 复制现有的音频文件（如果有）
        echo "⚠️  未找到sox或ffmpeg，创建空的音频文件..."
        
        # 创建空的音频文件
        echo "RIFF" > assets/sounds/test.wav
        echo "✅ 创建占位文件: assets/sounds/test.wav"
    fi
fi

# 创建一些示例音频文件的说明
echo ""
echo "📁 音频文件列表:"
find assets/sounds -name "*.wav" -type f 2>/dev/null | while read file; do
    size=$(stat -c%s "$file" 2>/dev/null || echo "N/A")
    echo "  - $(basename "$file") (${size} bytes)"
done

echo ""
echo "🎉 音频文件创建完成！"