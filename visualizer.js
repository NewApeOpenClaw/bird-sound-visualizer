// 鸟类声音可视化器 - 主JavaScript文件

// 全局变量
let audioContext;
let audioSource;
let analyser;
let audioBuffer;
let isPlaying = false;
let currentVisualizationMode = 'waveform';
let animationId;
let frequencyData;
let timeData;
let audioSourceCreated = false;

// 鸟类数据
const birdData = {
    nightingale: {
        name: "夜莺",
        description: "夜莺以其优美动听的歌声而闻名，通常在夜间歌唱。它们的歌声复杂多变，包含多种旋律和颤音。",
        size: "16-17厘米",
        weight: "18-23克",
        habitat: "欧洲、亚洲、非洲",
        soundChar: "婉转悠扬，多变的旋律"
    },
    sparrow: {
        name: "麻雀",
        description: "麻雀是常见的小型鸟类，叫声清脆活泼。它们的声音通常由短促的啁啾声组成。",
        size: "14-16厘米",
        weight: "24-40克",
        habitat: "全球广泛分布",
        soundChar: "清脆活泼，短促的啁啾"
    },
    eagle: {
        name: "老鹰",
        description: "老鹰是大型猛禽，叫声雄壮有力。它们的叫声通常高亢而具有穿透力。",
        size: "66-100厘米",
        weight: "3-6.3公斤",
        habitat: "全球多个地区",
        soundChar: "雄壮有力，高亢穿透"
    },
    owl: {
        name: "猫头鹰",
        description: "猫头鹰是夜行性鸟类，叫声神秘低沉。不同种类的猫头鹰有不同的叫声特点。",
        size: "13-71厘米",
        weight: "50克-4公斤",
        habitat: "全球分布",
        soundChar: "神秘低沉，有节奏的鸣叫"
    },
    parrot: {
        name: "鹦鹉",
        description: "鹦鹉以其模仿能力而闻名，可以模仿人类语言和各种声音。叫声多变且富有表现力。",
        size: "8-100厘米",
        weight: "10克-1.7公斤",
        habitat: "热带、亚热带地区",
        soundChar: "多变模仿，富有表现力"
    },
    robin: {
        name: "知更鸟",
        description: "知更鸟以其甜美的歌声而闻名，通常在清晨和黄昏歌唱。叫声悦耳动听。",
        size: "12.5-14厘米",
        weight: "16-22克",
        habitat: "欧洲、北美",
        soundChar: "甜美悦耳，旋律性强"
    }
};

// 初始化
document.addEventListener('DOMContentLoaded', function() {
    initAudioContext();
    setupEventListeners();
    createFrequencyBars();
    updateBirdInfo('nightingale');
});

// 初始化音频上下文
function initAudioContext() {
    try {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
        analyser = audioContext.createAnalyser();
        analyser.fftSize = 2048;
        
        const bufferLength = analyser.frequencyBinCount;
        frequencyData = new Uint8Array(bufferLength);
        timeData = new Uint8Array(bufferLength);
        
        console.log("音频上下文初始化成功");
    } catch (error) {
        console.error("音频上下文初始化失败:", error);
        alert("您的浏览器不支持Web Audio API，请使用Chrome、Firefox或Edge等现代浏览器。");
    }
}

// 设置事件监听器
function setupEventListeners() {
    // 文件上传
    const fileInput = document.getElementById('fileInput');
    const uploadArea = document.getElementById('uploadArea');
    
    fileInput.addEventListener('change', handleFileSelect);
    
    // 拖放上传
    uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadArea.style.borderColor = '#4cc9f0';
        uploadArea.style.background = 'rgba(76, 201, 240, 0.1)';
    });
    
    uploadArea.addEventListener('dragleave', () => {
        uploadArea.style.borderColor = 'rgba(76, 201, 240, 0.3)';
        uploadArea.style.background = 'transparent';
    });
    
    uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadArea.style.borderColor = 'rgba(76, 201, 240, 0.3)';
        uploadArea.style.background = 'transparent';
        
        if (e.dataTransfer.files.length) {
            handleFileSelect({ target: { files: e.dataTransfer.files } });
        }
    });
    
    // 音频播放器事件
    const audioPlayer = document.getElementById('audioPlayer');
    audioPlayer.addEventListener('play', () => {
        isPlaying = true;
        document.getElementById('playBtn').innerHTML = '<i class="fas fa-pause"></i> 暂停';
        startVisualization();
    });
    
    audioPlayer.addEventListener('pause', () => {
        isPlaying = false;
        document.getElementById('playBtn').innerHTML = '<i class="fas fa-play"></i> 播放';
        stopVisualization();
    });
    
    audioPlayer.addEventListener('ended', () => {
        isPlaying = false;
        document.getElementById('playBtn').innerHTML = '<i class="fas fa-play"></i> 播放';
        stopVisualization();
    });
}

// 处理文件选择
function handleFileSelect(event) {
    const file = event.target.files[0];
    if (!file) return;

    if (!file.type.match('audio.*')) {
        alert('请选择音频文件！');
        return;
    }

    // 显示文件信息
    const fileInfo = document.getElementById('fileInfo');
    const fileName = document.getElementById('fileName');
    const fileSize = document.getElementById('fileSize');
    const fileDuration = document.getElementById('fileDuration');

    fileName.textContent = file.name;
    fileSize.textContent = formatFileSize(file.size);
    fileInfo.style.display = 'block';

    // 创建音频URL
    const audioURL = URL.createObjectURL(file);

    // 先加载音频获取时长
    const tempAudio = new Audio();
    tempAudio.src = audioURL;
    tempAudio.onloadedmetadata = function() {
        fileDuration.textContent = formatDuration(tempAudio.duration);
    };

    loadAudio(audioURL);

    // 清除预设鸟类信息
    updateBirdInfo(null);
}

// 加载预设声音
function loadPresetSound(birdType) {
    console.log(`加载 ${birdType} 的声音`);
    
    // 更新鸟类信息
    updateBirdInfo(birdType);
    
    const audioPlayer = document.getElementById('audioPlayer');
    const fileInfo = document.getElementById('fileInfo');
    const fileName = document.getElementById('fileName');
    const fileDuration = document.getElementById('fileDuration');
    
    // 根据鸟类类型设置不同的音频文件
    const audioFiles = {
        nightingale: 'assets/sounds/test.wav',
        sparrow: 'assets/sounds/test.wav',
        eagle: 'assets/sounds/test.wav',
        owl: 'assets/sounds/test.wav',
        parrot: 'assets/sounds/test.wav',
        robin: 'assets/sounds/test.wav'
    };
    
    const audioFile = audioFiles[birdType] || 'assets/sounds/test.wav';
    
    fileName.textContent = `${birdData[birdType].name}.wav`;
    fileDuration.textContent = '3:00';
    document.getElementById('fileSize').textContent = '259 KB';
    fileInfo.style.display = 'block';
    
    // 加载音频文件
    loadAudio(audioFile);
}

// 加载音频
function loadAudio(url) {
    stopAudio();

    const audioPlayer = document.getElementById('audioPlayer');
    audioPlayer.src = url;

    // 重置播放按钮
    isPlaying = false;
    document.getElementById('playBtn').innerHTML = '<i class="fas fa-play"></i> 播放';

    // 使用 AudioContext 解码音频数据用于可视化分析
    if (audioContext) {
        // 对于 blob URL，需要使用 fetch
        fetch(url)
            .then(response => {
                if (!response.ok) throw new Error('网络响应失败');
                return response.arrayBuffer();
            })
            .then(arrayBuffer => audioContext.decodeAudioData(arrayBuffer))
            .then(buffer => {
                audioBuffer = buffer;
                console.log("音频缓冲区加载成功，时长:", buffer.duration.toFixed(2), "秒");
            })
            .catch(error => {
                console.warn("音频解码失败，可视化可能不工作:", error.message);
            });
    }
}

// 切换播放/暂停
function togglePlay() {
    const audioPlayer = document.getElementById('audioPlayer');

    // 确保 AudioContext 处于运行状态（浏览器需要用户交互后才能播放音频）
    if (audioContext && audioContext.state === 'suspended') {
        audioContext.resume();
    }

    if (audioPlayer.paused) {
        audioPlayer.play().catch(error => {
            console.error("播放失败:", error);
            alert("无法播放音频，请确保使用了本地服务器运行！");
        });
    } else {
        audioPlayer.pause();
    }
}

// 停止音频
function stopAudio() {
    const audioPlayer = document.getElementById('audioPlayer');
    audioPlayer.pause();
    audioPlayer.currentTime = 0;
    isPlaying = false;
    document.getElementById('playBtn').innerHTML = '<i class="fas fa-play"></i> 播放';
    stopVisualization();
}

// 改变音量
function changeVolume(value) {
    const audioPlayer = document.getElementById('audioPlayer');
    audioPlayer.volume = value / 100;
}

// 设置可视化模式
function setVisualizationMode(mode) {
    currentVisualizationMode = mode;
    
    // 更新按钮状态
    document.querySelectorAll('.mode-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector(`[data-mode="${mode}"]`).classList.add('active');
    
    // 如果正在播放，重新开始可视化
    if (isPlaying) {
        stopVisualization();
        startVisualization();
    }
}

// 开始可视化
function startVisualization() {
    // 确保 AudioContext 处于运行状态
    if (audioContext && audioContext.state === 'suspended') {
        audioContext.resume();
    }

    if (!audioSource) {
        setupAudioSource();
    }

    // 断开之前的连接，防止重复
    if (audioSource) {
        try {
            audioSource.disconnect();
        } catch (e) {}

        // 重新连接: audioElement -> analyser -> destination
        audioSource.connect(analyser);
        analyser.connect(audioContext.destination);
    }

    // 根据模式选择可视化函数
    const visualizeFunctions = {
        'waveform': visualizeWaveform,
        'spectrum': visualizeSpectrum,
        'circular': visualizeCircular,
        'particle': visualizeParticle,
        'all': visualizeAll
    };
    
    const visualize = visualizeFunctions[currentVisualizationMode] || visualizeWaveform;
    
    // 开始动画循环
    function animate() {
        if (!isPlaying) return;
        
        analyser.getByteTimeDomainData(timeData);
        analyser.getByteFrequencyData(frequencyData);
        
        // 更新音频分析信息
        updateAudioInfo();
        
        // 执行可视化
        visualize();
        
        animationId = requestAnimationFrame(animate);
    }
    
    animate();
}

// 停止可视化
function stopVisualization() {
    if (animationId) {
        cancelAnimationFrame(animationId);
    }
    
    // 清除画布
    const canvases = document.querySelectorAll('canvas');
    canvases.forEach(canvas => {
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    });
}

// 设置音频源
function setupAudioSource() {
    if (!audioContext) return;

    const audioPlayer = document.getElementById('audioPlayer');

    // 只创建一次 audioSource
    if (!audioSourceCreated) {
        audioSource = audioContext.createMediaElementSource(audioPlayer);
        audioSourceCreated = true;
    }

    // 断开之前的连接，重新连接
    if (audioSource) {
        audioSource.disconnect();
    }
}

// 可视化函数 - 增强版
function visualizeWaveform() {
    const canvas = document.getElementById('waveformCanvas');
    const ctx = canvas.getContext('2d');

    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;

    const width = canvas.width;
    const height = canvas.height;
    const centerY = height / 2;

    // 拖尾效果
    ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
    ctx.fillRect(0, 0, width, height);

    // 计算平均音量用于动态效果
    let avg = 0;
    for (let i = 0; i < timeData.length; i++) {
        avg += Math.abs(timeData[i] - 128);
    }
    avg = avg / timeData.length;

    // 外发光效果
    ctx.shadowBlur = 20 + avg * 0.5;
    ctx.shadowColor = '#4cc9f0';

    // 绘制主波形
    ctx.beginPath();
    const sliceWidth = width / timeData.length;
    let x = 0;

    for (let i = 0; i < timeData.length; i++) {
        const v = timeData[i] / 128.0;
        const y = v * height / 2;

        if (i === 0) {
            ctx.moveTo(x, y);
        } else {
            ctx.lineTo(x, y);
        }
        x += sliceWidth;
    }

    // 渐变色
    const gradient = ctx.createLinearGradient(0, 0, width, 0);
    gradient.addColorStop(0, '#ff006e');
    gradient.addColorStop(0.25, '#fb5607');
    gradient.addColorStop(0.5, '#ffbe0b');
    gradient.addColorStop(0.75, '#06d6a0');
    gradient.addColorStop(1, '#3a86ff');

    ctx.strokeStyle = gradient;
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.stroke();

    // 绘制镜像波形（倒影效果）
    ctx.beginPath();
    x = 0;
    ctx.shadowBlur = 0; // 倒影不发光

    for (let i = 0; i < timeData.length; i++) {
        const v = timeData[i] / 128.0;
        const y = height - (v * height / 2);

        if (i === 0) {
            ctx.moveTo(x, y);
        } else {
            ctx.lineTo(x, y);
        }
        x += sliceWidth;
    }

    const gradient2 = ctx.createLinearGradient(0, height, width, height);
    gradient2.addColorStop(0, 'rgba(255, 0, 110, 0.3)');
    gradient2.addColorStop(0.5, 'rgba(58, 134, 255, 0.3)');
    gradient2.addColorStop(1, 'rgba(6, 214, 160, 0.3)');

    ctx.strokeStyle = gradient2;
    ctx.lineWidth = 2;
    ctx.stroke();

    // 中心线
    ctx.beginPath();
    ctx.moveTo(0, centerY);
    ctx.lineTo(width, centerY);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.lineWidth = 1;
    ctx.stroke();
}

function visualizeSpectrum() {
    const canvas = document.getElementById('spectrumCanvas');
    const ctx = canvas.getContext('2d');

    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;

    const width = canvas.width;
    const height = canvas.height;

    // 拖尾效果
    ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
    ctx.fillRect(0, 0, width, height);

    // 绘制频谱条
    const barCount = 48;
    const barWidth = width / barCount - 4;
    let x = (width - (barWidth + 4) * barCount) / 2;

    // 启用发光
    ctx.shadowBlur = 15;

    for (let i = 0; i < barCount; i++) {
        const dataIndex = Math.floor(i / barCount * frequencyData.length);
        const magnitude = frequencyData[dataIndex];
        // 添加平滑处理
        const barHeight = magnitude * (height * 0.85 / 255);

        // 动态颜色 - 基于频率位置
        const hue = (i / barCount) * 60 + 280; // 紫色到粉色范围

        // 主条形
        ctx.shadowColor = `hsla(${hue}, 100%, 60%, 0.8)`;

        const gradient = ctx.createLinearGradient(0, height - barHeight, 0, height);
        gradient.addColorStop(0, `hsla(${hue}, 100%, 70%, 1)`);
        gradient.addColorStop(0.5, `hsla(${hue}, 100%, 55%, 0.9)`);
        gradient.addColorStop(1, `hsla(${hue}, 100%, 40%, 0.7)`);

        ctx.fillStyle = gradient;
        ctx.fillRect(x, height - barHeight, barWidth, barHeight);

        // 倒影效果
        const reflectGradient = ctx.createLinearGradient(0, height, 0, height + barHeight * 0.3);
        reflectGradient.addColorStop(0, `hsla(${hue}, 100%, 50%, 0.3)`);
        reflectGradient.addColorStop(1, `hsla(${hue}, 100%, 50%, 0)`);

        ctx.fillStyle = reflectGradient;
        ctx.fillRect(x, height, barWidth, barHeight * 0.3);

        // 顶部亮点
        if (barHeight > 10) {
            ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
            ctx.fillRect(x, height - barHeight, barWidth, 3);
        }

        x += barWidth + 4;
    }

    ctx.shadowBlur = 0;
}

function visualizeCircular() {
    const canvas = document.getElementById('circularCanvas');
    const ctx = canvas.getContext('2d');

    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;

    const width = canvas.width;
    const height = canvas.height;
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(width, height) * 0.22;

    // 拖尾效果
    ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
    ctx.fillRect(0, 0, width, height);

    // 旋转角度（随时间变化）
    const rotation = Date.now() * 0.0003;

    // 外圈光晕
    ctx.shadowBlur = 30;
    ctx.shadowColor = '#ff006e';

    // 绘制多层圆形背景
    for (let r = radius; r > 0; r -= radius / 4) {
        ctx.beginPath();
        ctx.arc(centerX, centerY, r, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(76, 201, 240, ${0.05 + (1 - r / radius) * 0.1})`;
        ctx.lineWidth = 1;
        ctx.stroke();
    }

    ctx.shadowBlur = 0;

    // 绘制频谱线 - 外圈
    const barCount = 180;
    const angleStep = (Math.PI * 2) / barCount;

    for (let i = 0; i < barCount; i++) {
        const dataIndex = Math.floor(i / barCount * frequencyData.length);
        const magnitude = frequencyData[dataIndex];
        const barLength = radius * 0.4 + (magnitude / 255) * radius * 0.8;

        const angle = i * angleStep + rotation;
        const x1 = centerX + Math.cos(angle) * radius;
        const y1 = centerY + Math.sin(angle) * radius;
        const x2 = centerX + Math.cos(angle) * (radius + barLength);
        const y2 = centerY + Math.sin(angle) * (radius + barLength);

        // 动态颜色
        const hue = (i / barCount) * 360;

        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);

        const gradient = ctx.createLinearGradient(x1, y1, x2, y2);
        gradient.addColorStop(0, `hsla(${hue}, 100%, 60%, 0.9)`);
        gradient.addColorStop(1, `hsla(${(hue + 60) % 360}, 100%, 70%, 0.5)`);

        ctx.strokeStyle = gradient;
        ctx.lineWidth = 2 + (magnitude / 255) * 3;
        ctx.lineCap = 'round';
        ctx.stroke();

        // 端点亮点
        if (magnitude > 100) {
            ctx.beginPath();
            ctx.arc(x2, y2, 3, 0, Math.PI * 2);
            ctx.fillStyle = `hsla(${hue}, 100%, 80%, 0.9)`;
            ctx.fill();
        }
    }

    // 中心发光球体
    const avgMagnitude = frequencyData.slice(0, 50).reduce((a, b) => a + b, 0) / 50;
    const centerRadius = 20 + avgMagnitude * 0.15;

    const centerGradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, centerRadius);
    centerGradient.addColorStop(0, 'rgba(255, 255, 255, 0.9)');
    centerGradient.addColorStop(0.3, 'rgba(255, 0, 110, 0.8)');
    centerGradient.addColorStop(0.7, 'rgba(251, 86, 7, 0.4)');
    centerGradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

    ctx.beginPath();
    ctx.arc(centerX, centerY, centerRadius, 0, Math.PI * 2);
    ctx.fillStyle = centerGradient;
    ctx.fill();
}

function visualizeParticle() {
    const canvas = document.getElementById('particleCanvas');
    const ctx = canvas.getContext('2d');

    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;

    const width = canvas.width;
    const height = canvas.height;

    // 拖尾效果
    ctx.fillStyle = 'rgba(0, 0, 0, 0.12)';
    ctx.fillRect(0, 0, width, height);

    const particleCount = 150;
    const centerX = width / 2;
    const centerY = height / 2;
    const time = Date.now() * 0.001;

    // 计算平均音量
    let avgMag = 0;
    for (let i = 0; i < frequencyData.length; i += 10) {
        avgMag += frequencyData[i];
    }
    avgMag = avgMag / (frequencyData.length / 10);

    // 存储粒子位置用于连线
    const particles = [];

    // 启用发光
    ctx.shadowBlur = 10;

    for (let i = 0; i < particleCount; i++) {
        const dataIndex = Math.floor(i / particleCount * frequencyData.length);
        const magnitude = frequencyData[dataIndex] / 255;

        // 多层轨道运动
        const layer = i % 3;
        const baseSpeed = 0.0005 + layer * 0.0003;
        const angle = (i / particleCount) * Math.PI * 6 + time * (1 + layer * 0.5);

        const baseRadius = 50 + layer * 40;
        const distance = baseRadius + magnitude * 180;
        const size = 1 + magnitude * 6 + layer * 2;

        const x = centerX + Math.cos(angle) * distance;
        const y = centerY + Math.sin(angle) * distance;

        particles.push({ x, y, magnitude });

        // 粒子颜色 - 彩虹渐变
        const hue = (dataIndex / frequencyData.length * 60 + time * 30 + 280) % 360;

        // 外发光
        ctx.shadowColor = `hsla(${hue}, 100%, 60%, 0.8)`;

        // 绘制粒子
        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${hue}, 100%, 65%, ${0.5 + magnitude * 0.5})`;
        ctx.fill();

        // 光晕
        ctx.beginPath();
        ctx.arc(x, y, size * 2.5, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${hue}, 100%, 60%, ${0.1 + magnitude * 0.15})`;
        ctx.fill();
    }

    ctx.shadowBlur = 0;

    // 粒子之间连线 - 当距离近时
    for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
            const dx = particles[i].x - particles[j].x;
            const dy = particles[i].y - particles[j].y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < 60) {
                const avgMag2 = (particles[i].magnitude + particles[j].magnitude) / 2;
                ctx.beginPath();
                ctx.moveTo(particles[i].x, particles[i].y);
                ctx.lineTo(particles[j].x, particles[j].y);
                ctx.strokeStyle = `rgba(76, 201, 240, ${(1 - dist / 60) * avgMag2 * 0.4})`;
                ctx.lineWidth = 1;
                ctx.stroke();
            }
        }
    }

    // 中心能量球
    const energyRadius = 30 + avgMag * 0.3;
    const energyGradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, energyRadius);
    energyGradient.addColorStop(0, 'rgba(255, 255, 255, 0.9)');
    energyGradient.addColorStop(0.2, 'rgba(255, 0, 110, 0.8)');
    energyGradient.addColorStop(0.5, 'rgba(251, 86, 7, 0.4)');
    energyGradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

    ctx.beginPath();
    ctx.arc(centerX, centerY, energyRadius, 0, Math.PI * 2);
    ctx.fillStyle = energyGradient;
    ctx.fill();
}

function visualizeAll() {
    // 显示所有可视化
    visualizeWaveform();
    visualizeSpectrum();
    visualizeCircular();
    visualizeParticle();
}

// 更新音频分析信息
function updateAudioInfo() {
    // 计算平均频率
    let sum = 0;
    let count = 0;
    for (let i = 0; i < frequencyData.length; i++) {
        if (frequencyData[i] > 0) {
            sum += i * (frequencyData[i] / 255);
            count++;
        }
    }
    const avgFrequency = count > 0 ? (sum / count) * (audioContext.sampleRate / 2 / frequencyData.length) : 0;
    
    // 计算平均音量
    let volumeSum = 0;
    for (let i = 0; i < timeData.length; i++) {
        const value = (timeData[i] - 128) / 128;
        volumeSum += value * value;
    }
    const rms = Math.sqrt(volumeSum / timeData.length);
    const db = 20 * Math.log10(rms);
    
    // 更新显示
    document.getElementById('currentFreq').textContent = `${Math.round(avgFrequency)} Hz`;
    document.getElementById('currentVolume').textContent = `${db.toFixed(1)} dB`;
    
    // 简单音调检测
    let pitch = "低音";
    if (avgFrequency > 1000) pitch = "高音";
    else if (avgFrequency > 500) pitch = "中音";
    document.getElementById('currentPitch').textContent = pitch;
    
    // 简单节奏检测（基于音量变化）
    const tempo = Math.round(rms * 120);
    document.getElementById('currentTempo').textContent = `${tempo} BPM`;
    
    // 更新频率条
    updateFrequencyBars();
}

// 创建频率条
function createFrequencyBars() {
    const container = document.getElementById('frequencyBars');
    container.innerHTML = '';
    
    for (let i = 0; i < 32; i++) {
        const bar = document.createElement('div');
        bar.className = 'freq-bar';
        bar.style.height = '5px';
        container.appendChild(bar);
    }
}

// 更新频率条
function updateFrequencyBars() {
    const bars = document.querySelectorAll('.freq-bar');
    
    for (let i = 0; i < bars.length; i++) {
        const dataIndex = Math.floor(i / bars.length * frequencyData.length);
        const magnitude = frequencyData[dataIndex] / 255;
        
        bars[i].style.height = `${5 + magnitude * 95}px`;
        
        // 根据频率设置颜色
        const hue = (dataIndex / frequencyData.length) * 360;
        bars[i].style.background = `linear-gradient(to top, hsl(${hue}, 100%, 50%), hsl(${hue}, 100%, 70%))`;
    }
}

// 更新鸟类信息
function updateBirdInfo(birdType) {
    const birdInfo = document.getElementById('birdInfo');
    const birdName = document.getElementById('birdName');
    const birdDescription = document.getElementById('birdDescription');
    const birdSize = document.getElementById('birdSize');
    const birdWeight = document.getElementById('birdWeight');
    const birdHabitat = document.getElementById('birdHabitat');
    const birdSoundChar = document.getElementById('birdSoundChar');
    const birdImage = document.querySelector('.bird-image i');
    
    if (!birdType || !birdData[birdType]) {
        birdName.textContent = "选择一种鸟类";
        birdDescription.textContent = "点击上面的鸟类按钮查看详细信息";
        birdSize.textContent = "-";
        birdWeight.textContent = "-";
        birdHabitat.textContent = "-";
        birdSoundChar.textContent = "-";
        birdImage.className = "fas fa-dove";
        return;
    }
    
    const bird = birdData[birdType];
    
    birdName.textContent = bird.name;
    birdDescription.textContent = bird.description;
    birdSize.textContent = bird.size;
    birdWeight.textContent = bird.weight;
    birdHabitat.textContent = bird.habitat;
    birdSoundChar.textContent = bird.soundChar;
    
    // 根据鸟类类型设置图标
    const iconMap = {
        nightingale: "fas fa-dove",
        sparrow: "fas fa-crow",
        eagle: "fas fa-feather",
        owl: "fas fa-moon",
        parrot: "fas fa-kiwi-bird",
        robin: "fas fa-feather-alt"
    };
    
    birdImage.className = iconMap[birdType] || "fas fa-dove";
}

// 工具函数
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// 格式化音频时长
function formatDuration(seconds) {
    if (!seconds || isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
}

// 窗口大小调整时重新设置画布
window.addEventListener('resize', () => {
    if (isPlaying) {
        stopVisualization();
        startVisualization();
    }
});

// 导出函数供HTML调用
window.loadPresetSound = loadPresetSound;
window.togglePlay = togglePlay;
window.stopAudio = stopAudio;
window.changeVolume = changeVolume;
window.setVisualizationMode = setVisualizationMode;