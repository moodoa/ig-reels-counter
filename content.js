let totalReelsWatched = 0;
let totalTimeSpent = 0; 
let reelTimer = null;

const processedVideos = new WeakSet();

const counterElement = document.createElement('div');
counterElement.id = 'reels-counter';
document.body.appendChild(counterElement);

function updateCounterDisplay() {
    const minutes = Math.floor(totalTimeSpent / 60);
    const seconds = totalTimeSpent % 60;
    const today = new Date().toLocaleDateString('zh-TW', { year: 'numeric', month: 'long', day: 'numeric' });

    counterElement.innerHTML = `
        <div style="margin-bottom: 5px;">${today}</div>
        <div>你看了</div>
        <div><strong>${totalReelsWatched}</strong> 部廢片了！！</div>
        <div>共 <strong>${minutes}分 ${seconds}秒</strong></div>
        <button id="reset-counter-btn" style="margin-top: 5px;">重置</button>
    `;
}

function saveData() {
    chrome.storage.local.set({
        reelsWatched: totalReelsWatched,
        timeSpent: totalTimeSpent
    });
}

function resetCounter() {
    if (confirm('確定要重置所有計數嗎？')) {
        totalReelsWatched = 0;
        totalTimeSpent = 0;
        saveData();
        updateCounterDisplay();
    }
}

counterElement.addEventListener('click', (event) => {
    if (event.target.id === 'reset-counter-btn') {
        resetCounter();
    }
});

chrome.storage.local.get(['reelsWatched', 'timeSpent'], (result) => {
    totalReelsWatched = result.reelsWatched || 0;
    totalTimeSpent = result.timeSpent || 0;
    updateCounterDisplay();
});

function handlePlay(event) {
    const video = event.target;
    if (!video.dataset.reelCounted) {
        video.dataset.reelCounted = 'true';
        totalReelsWatched++;
    }

    if (reelTimer) clearInterval(reelTimer);
    reelTimer = setInterval(() => {
        totalTimeSpent++;
        saveData();
        updateCounterDisplay();
    }, 1000);
}

function handlePause() {
    if (reelTimer) clearInterval(reelTimer);
    reelTimer = null;
}

function setupVideoListeners() {
    const videos = document.querySelectorAll('video');
    videos.forEach(video => {
        if (!processedVideos.has(video)) {
            video.addEventListener('play', handlePlay);
            video.addEventListener('pause', handlePause);
            video.addEventListener('ended', handlePause);
            processedVideos.add(video);
        }
    });
}

setInterval(setupVideoListeners, 1500);

setupVideoListeners();
updateCounterDisplay();
