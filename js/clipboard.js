// js/clipboard.js
// 클립보드 복사 및 토스트 알림 기능

let copyCount = parseInt(localStorage.getItem('copyCount') || '0', 10);
updateCopyCountUI();

// 톤 생성 (Web Audio API를 이용한 가벼운 팝 사운드)
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
function playPopSound() {
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  const oscillator = audioCtx.createOscillator();
  const gainNode = audioCtx.createGain();

  oscillator.type = 'sine';
  oscillator.frequency.setValueAtTime(600, audioCtx.currentTime); // 시작 주파수
  oscillator.frequency.exponentialRampToValueAtTime(1200, audioCtx.currentTime + 0.1); // 피치 상승 (팝 느낌)
  
  gainNode.gain.setValueAtTime(0.5, audioCtx.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.1);

  oscillator.connect(gainNode);
  gainNode.connect(audioCtx.destination);

  oscillator.start();
  oscillator.stop(audioCtx.currentTime + 0.1);
}

// 클립보드 복사 함수 (최신 API 우선, fallback 지원)
function copyToClipboard(text) {
  if (navigator.clipboard && window.isSecureContext) {
    // navigator.clipboard API 사용 (HTTPS 환경)
    navigator.clipboard.writeText(text).then(() => {
      onCopySuccess();
    }).catch(err => {
      console.error('클립보드 복사 실패:', err);
      fallbackCopyTextToClipboard(text);
    });
  } else {
    fallbackCopyTextToClipboard(text);
  }
}

// 구형 브라우저/HTTP 환경 대응 Fallback
function fallbackCopyTextToClipboard(text) {
  const textArea = document.createElement("textarea");
  textArea.value = text;
  
  // 화면 밖으로 숨김
  textArea.style.position = "fixed";
  textArea.style.top = "-9999px";
  textArea.style.left = "-9999px";
  
  document.body.appendChild(textArea);
  textArea.focus();
  textArea.select();

  try {
    const successful = document.execCommand('copy');
    if (successful) {
      onCopySuccess();
    } else {
      showToast("❌ 복사에 실패했습니다. 직접 선택해서 복사해주세요.", true);
    }
  } catch (err) {
    console.error('Fallback 복사 실패:', err);
    showToast("❌ 브라우저가 복사를 지원하지 않습니다.", true);
  }

  document.body.removeChild(textArea);
}

// 복사 성공 시 처리 로직
function onCopySuccess() {
  copyCount++;
  localStorage.setItem('copyCount', copyCount);
  updateCopyCountUI();
  playPopSound();
  showToast("🎉 클립보드에 복사되었습니다! 유튜브에 붙여넣으세요!");
}

// 복사 횟수 UI 업데이트
function updateCopyCountUI() {
  const countEl = document.getElementById('copy-count');
  if (countEl) {
    countEl.innerText = copyCount;
  }
}

// 플로팅 토스트 알림 표시
function showToast(message, isError = false) {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = 'toast';
  if (isError) toast.style.boxShadow = "0 10px 30px rgba(255, 0, 0, 0.3)";
  
  toast.innerText = message;
  container.appendChild(toast);

  // 2.5초 후 사라짐 애니메이션 적용
  setTimeout(() => {
    toast.classList.add('fade-out');
    // 애니메이션이 끝난 후 DOM에서 제거
    toast.addEventListener('animationend', () => {
      toast.remove();
    });
  }, 2500);
}
