#!/bin/bash
# 鸟类声音可视化器 - 部署脚本

echo "🐦 鸟类声音可视化器部署脚本"
echo "=============================="

# 检查必要工具
check_tool() {
    if ! command -v $1 &> /dev/null; then
        echo "❌ 未找到 $1，请先安装"
        return 1
    fi
    echo "✅ 找到 $1"
    return 0
}

echo ""
echo "🔧 检查工具..."
check_tool "python3" || exit 1
check_tool "git" || exit 1

# 创建目录结构
echo ""
echo "📁 创建目录结构..."
mkdir -p assets/sounds
mkdir -p assets/images

# 复制文件到当前目录（如果从其他地方运行）
if [ "$(pwd)" != "/tmp/bird-sound-visualizer" ]; then
    echo ""
    echo "📋 复制文件到当前目录..."
    cp -r /tmp/bird-sound-visualizer/* .
fi

# 设置权限
echo ""
echo "🔐 设置文件权限..."
chmod +x deploy.sh
chmod 644 *.html *.css *.js *.md

# 检查文件
echo ""
echo "📄 检查项目文件..."
files=("index.html" "style.css" "visualizer.js" "README.md")
for file in "${files[@]}"; do
    if [ -f "$file" ]; then
        echo "✅ $file 存在"
    else
        echo "❌ $file 不存在"
    fi
done

# 提供运行选项
echo ""
echo "🚀 选择运行方式："
echo "1. Python HTTP服务器 (端口 8000)"
echo "2. Node.js (需要安装 serve)"
echo "3. 直接打开 (文件浏览器)"
echo "4. 仅检查，不运行"
echo ""
read -p "请输入选项 (1-4): " choice

case $choice in
    1)
        echo ""
        echo "🐍 启动Python HTTP服务器..."
        echo "在浏览器中访问: http://localhost:8000"
        echo "按 Ctrl+C 停止服务器"
        python3 -m http.server 8000
        ;;
    2)
        if command -v npx &> /dev/null; then
            echo ""
            echo "🟢 启动Node.js服务器..."
            echo "在浏览器中访问: http://localhost:3000"
            echo "按 Ctrl+C 停止服务器"
            npx serve
        else
            echo "❌ 未找到 npx，请先安装 Node.js"
            exit 1
        fi
        ;;
    3)
        echo ""
        echo "📂 在文件浏览器中打开..."
        if command -v xdg-open &> /dev/null; then
            xdg-open index.html
        elif command -v open &> /dev/null; then
            open index.html
        else
            echo "⚠️  无法自动打开，请手动打开 index.html"
        fi
        ;;
    4)
        echo ""
        echo "✅ 检查完成！"
        echo "项目文件已准备就绪。"
        ;;
    *)
        echo "❌ 无效选项"
        exit 1
        ;;
esac

# 使用说明
echo ""
echo "📖 使用说明："
echo "1. 上传音频文件或点击预设鸟类按钮"
echo "2. 点击播放按钮开始可视化"
echo "3. 切换不同的可视化模式"
echo "4. 查看右侧的鸟类信息"

echo ""
echo "🎉 部署完成！享受鸟类声音的视觉之旅吧！"