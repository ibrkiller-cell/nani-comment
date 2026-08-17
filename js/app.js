// js/app.js
// 수만 가지 조합을 생성하는 동적 랜덤 추출 및 UI 렌더링 로직

document.addEventListener('DOMContentLoaded', () => {
  if (!window.dict) {
    document.querySelector('main').innerHTML = '<p style="text-align:center; color:red;">데이터를 불러오는 데 실패했습니다. data.js를 확인해주세요.</p>';
    return;
  }

  function getRandomItem(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  }

  function getRandomEmojis(emojiGroup, min, max) {
    const emojis = window.dict.emojis[emojiGroup] || ["✨"];
    const count = Math.floor(Math.random() * (max - min + 1)) + min;
    let result = "";
    for(let i=0; i<count; i++) {
      result += getRandomItem(emojis);
    }
    return result;
  }

  // 미리 생성된 200개의 고정 풀을 담을 객체
  const preGeneratedPools = {};

  function initPools() {
    for (const key in window.dict) {
      if (key === 'emojis') continue;
      
      const data = window.dict[key];
      const pool = new Set();
      let attempts = 0;
      
      // Quiz나 SongQuiz는 이미 고정 배열이므로 200개까지 반복 복사해서 채우기
      if (data.type === 'static') {
        const arr = [];
        for(let i=0; i<200; i++) {
          arr.push(data.items[i % data.items.length]);
        }
        preGeneratedPools[key] = arr;
        continue;
      }

      // 200개가 찰 때까지 무작위 조합 생성
      while (pool.size < 200 && attempts < 10000) {
        attempts++;
        let result = "";

        if (data.type === 'emoji_only') {
          const length = Math.floor(Math.random() * 5) + 18;
          for(let i=0; i<length; i++) {
            result += getRandomItem(data.emojiPool);
          }
        } else {
          const prefix = getRandomItem(data.prefixes);
          const body = getRandomItem(data.bodies);
          const mid = getRandomItem(data.mids);
          const suffix = getRandomItem(data.suffixes);
          const frontEmojis = getRandomEmojis(data.emojis || 'fun', 2, 4);
          const midEmojis = getRandomEmojis(data.emojis || 'fun', 1, 3);
          const backEmojis = getRandomEmojis(data.emojis || 'fun', 3, 6);

          result = `${frontEmojis} ${prefix} ${body} ${midEmojis} ${mid} ${suffix} ${backEmojis}`.replace(/\s+/g, ' ').trim();
        }

        pool.add(result);
      }
      preGeneratedPools[key] = Array.from(pool);
    }
  }

  // 데이터 로드 시 풀 생성
  initPools();

  function generateReaction(category) {
    // 200개로 고정된 풀에서 하나를 무작위로 꺼내옴
    if (preGeneratedPools[category]) {
      return getRandomItem(preGeneratedPools[category]);
    }
    return "데이터를 불러오는 중입니다...";
  }

  function getGeneratedItems(categoryName, count) {
    const items = new Set();
    let attempts = 0;
    while(items.size < count && attempts < 100) {
      items.add(generateReaction(categoryName));
      attempts++;
    }
    return Array.from(items);
  }

  function renderCategory(categoryName, container) {
    container.innerHTML = '';
    
    const selectedItems = getGeneratedItems(categoryName, 5);

    selectedItems.forEach((text, index) => {
      const card = document.createElement('div');
      card.className = 'reaction-card animate-in';
      card.style.animationDelay = `${index * 0.08}s`;

      card.innerHTML = `
        <div class="card-content">${text.replace(/\n/g, '<br>')}</div>
        <div class="copy-hint">클릭해서 복사 📋</div>
      `;

      card.addEventListener('click', () => {
        if (typeof window.copyToClipboard === 'function') {
          window.copyToClipboard(text);
        }
      });

      container.appendChild(card);
    });
  }

  const sections = document.querySelectorAll('.category-section');
  
  sections.forEach(section => {
    const categoryName = section.getAttribute('data-category');
    const container = section.querySelector('.card-container');
    const shuffleBtn = section.querySelector('.shuffle-section-btn');

    renderCategory(categoryName, container);

    shuffleBtn.addEventListener('click', () => {
      shuffleBtn.style.transform = 'scale(0.9)';
      setTimeout(() => {
        shuffleBtn.style.transform = '';
      }, 100);

      renderCategory(categoryName, container);
    });
  });

  // AI Polish Integration
  const aiSubmitBtn = document.getElementById('ai-submit-btn');
  const aiTeaseBtn = document.getElementById('ai-tease-btn');
  const aiInput = document.getElementById('ai-input');
  const aiLoading = document.getElementById('ai-loading');
  const aiResultContainer = document.getElementById('ai-result-container');
  const GEMINI_API_KEY = "AQ.Ab8RN6I3zD42GEGDxBB8k1XKg2GR7gAAY7-DcluVX18EqFaqWg";

  async function generateAIComment(promptText) {
    const text = aiInput.value.trim();
    if (!text) {
      if (typeof window.showToast === 'function') window.showToast('먼저 텍스트를 입력해주세요!', true);
      return;
    }

    aiLoading.classList.remove('hidden');
    aiResultContainer.innerHTML = '';
    aiSubmitBtn.disabled = true;
    if (aiTeaseBtn) aiTeaseBtn.disabled = true;

    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: promptText + `\n\n[사용자 입력]: ${text}`
            }]
          }],
          generationConfig: {
            temperature: 0.7,
          }
        })
      });

      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }

      const data = await response.json();
      const resultText = data.candidates[0].content.parts[0].text.trim();

      // Render the result as a clickable card
      const card = document.createElement('div');
      card.className = 'reaction-card animate-in';
      card.innerHTML = `
        <div class="card-content">${resultText.replace(/\n/g, '<br>')}</div>
        <div class="copy-hint">클릭해서 복사 📋</div>
      `;

      card.addEventListener('click', () => {
        if (typeof window.copyToClipboard === 'function') {
          window.copyToClipboard(resultText);
        }
      });

      aiResultContainer.appendChild(card);
    } catch (error) {
      console.error(error);
      if (typeof window.showToast === 'function') window.showToast('오류가 발생했습니다. 잠시 후 다시 시도해주세요.', true);
    } finally {
      aiLoading.classList.add('hidden');
      aiSubmitBtn.disabled = false;
      if (aiTeaseBtn) aiTeaseBtn.disabled = false;
    }
  }

  aiSubmitBtn.addEventListener('click', () => {
    generateAIComment(`다음 텍스트를 유튜브 인터넷 방송 분위기에 맞게, 감성이 듬뿍 담긴 이모지를 적절히 섞어서 1~2문장의 부드럽고 유쾌한 시청자 채팅 멘트로 예쁘게 다듬어주세요. 반드시 결과 멘트만 출력하세요.`);
  });

  if (aiTeaseBtn) {
    aiTeaseBtn.addEventListener('click', () => {
      generateAIComment(`다음 텍스트를 바탕으로 인터넷 방송 방장(스트리머)을 장난스럽고 유쾌하게 놀리거나 팩트 폭행을 하는 1~2문장의 채팅 멘트로 만들어주세요. 악플이 되지 않도록 선을 지키며, 장난스러운 이모지(😜, 🤣, 👀 등)를 적극 사용하세요. 반드시 결과 멘트만 출력하세요.`);
    });
  }

});
