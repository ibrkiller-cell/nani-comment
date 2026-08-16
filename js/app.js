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
      if (data.type === 'static' && (key === 'Quiz' || key === 'SongQuiz')) {
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

});
