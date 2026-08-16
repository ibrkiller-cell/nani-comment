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

  function generateReaction(categoryName) {
    const data = window.dict[categoryName];
    if (!data) return "데이터가 없습니다.";

    // 정적 데이터(속담 퀴즈 등)일 경우 조합하지 않고 바로 반환
    if (data.type === 'static') {
      return getRandomItem(data.items);
    }

    // 조합형 데이터일 경우
    const prefix = getRandomItem(data.prefixes);
    const body = getRandomItem(data.bodies);
    const mid = data.mids ? getRandomItem(data.mids) : "";
    const suffix = getRandomItem(data.suffixes);

    // 이모지 팍팍 추가 (앞, 중간, 뒤)
    const frontEmojis = getRandomEmojis(data.emojis, 2, 4); // 앞부분 2~4개
    const midEmojis = getRandomEmojis(data.emojis, 1, 3);   // 중간부분 1~3개
    const backEmojis = getRandomEmojis(data.emojis, 3, 6);  // 뒷부분 3~6개

    // 길고 화려한 문장 생성
    const sentence = `${frontEmojis} ${prefix} ${body} ${midEmojis} ${mid} ${suffix} ${backEmojis}`;
    
    // 불필요한 연속 공백 제거
    return sentence.replace(/\s+/g, ' ').trim();
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
    
    const selectedItems = getGeneratedItems(categoryName, 3);

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
