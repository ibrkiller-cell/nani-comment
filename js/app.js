// js/app.js
// 수만 가지 조합을 생성하는 동적 랜덤 추출 및 UI 렌더링 로직

document.addEventListener('DOMContentLoaded', () => {
  // 데이터 무결성 체크
  if (!window.dict) {
    document.querySelector('main').innerHTML = '<p style="text-align:center; color:red;">데이터를 불러오는 데 실패했습니다. data.js를 확인해주세요.</p>';
    return;
  }

  // 무작위 요소 추출 유틸리티
  function getRandomItem(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  }

  // 이모지 다수 생성기
  function getRandomEmojis(emojiGroup, count) {
    const emojis = window.dict.emojis[emojiGroup] || ["✨"];
    let result = "";
    for(let i=0; i<count; i++) {
      result += getRandomItem(emojis);
    }
    return result;
  }

  // 1개의 무작위 문장 조합 생성
  function generateReaction(categoryName) {
    const data = window.dict[categoryName];
    if (!data) return "데이터가 없습니다.";

    const prefix = getRandomItem(data.prefixes);
    const body = getRandomItem(data.bodies);
    const suffix = getRandomItem(data.suffixes);

    // 랜덤하게 시작이나 끝에 이모지 1~3개 추가
    const emojiCount = Math.floor(Math.random() * 3) + 1; // 1~3개
    const extraEmojis = getRandomEmojis(data.emojis, emojiCount);

    // 50% 확률로 앞에 이모지 추가, 아니면 뒤에 추가
    if (Math.random() > 0.5) {
      return `${extraEmojis} ${prefix} ${body} ${suffix}`;
    } else {
      return `${prefix} ${body} ${suffix} ${extraEmojis}`;
    }
  }

  // 3개의 랜덤 아이템 추출 (중복 제거)
  function getGeneratedItems(categoryName, count) {
    const items = new Set();
    while(items.size < count) {
      items.add(generateReaction(categoryName));
    }
    return Array.from(items);
  }

  // 특정 카테고리 렌더링 함수
  function renderCategory(categoryName, container) {
    container.innerHTML = '';
    
    // 3개의 랜덤 멘트 동적 생성
    const selectedItems = getGeneratedItems(categoryName, 3);

    selectedItems.forEach((text, index) => {
      // 카드 요소 생성
      const card = document.createElement('div');
      card.className = 'reaction-card animate-in';
      card.style.animationDelay = `${index * 0.08}s`;

      card.innerHTML = `
        <div class="card-content">${text}</div>
        <div class="copy-hint">클릭해서 복사 📋</div>
      `;

      // 클릭 시 클립보드 복사
      card.addEventListener('click', () => {
        if (typeof window.copyToClipboard === 'function') {
          window.copyToClipboard(text);
        }
      });

      container.appendChild(card);
    });
  }

  // 모든 섹션 초기 렌더링 및 셔플 버튼 바인딩
  const sections = document.querySelectorAll('.category-section');
  
  sections.forEach(section => {
    const categoryName = section.getAttribute('data-category');
    const container = section.querySelector('.card-container');
    const shuffleBtn = section.querySelector('.shuffle-section-btn');

    // 초기 렌더링
    renderCategory(categoryName, container);

    // 개별 셔플 버튼 이벤트
    shuffleBtn.addEventListener('click', () => {
      // 버튼 애니메이션 효과
      shuffleBtn.style.transform = 'scale(0.9)';
      setTimeout(() => {
        shuffleBtn.style.transform = '';
      }, 100);

      renderCategory(categoryName, container);
    });
  });

});
