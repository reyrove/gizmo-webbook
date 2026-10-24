(function() {
  // ========== STORY DATA (from stories.js) ==========
  let allPanels = [];
  let currentPanelIndex = 0;
  let bookmarks = JSON.parse(localStorage.getItem('gizmoDarkBookmarksEN') || '[]');

  // ========== DOM ELEMENTS ==========
  const panelDisplay = document.getElementById('panelDisplay');
  const prevBtn = document.getElementById('prevPanelBtn');
  const nextBtn = document.getElementById('nextPanelBtn');
  const progressFill = document.getElementById('progressFill');
  const panelIndicator = document.getElementById('panelIndicator');
  const chapterSelect = document.getElementById('chapterSelect');
  const bookmarkToggleBtn = document.getElementById('bookmarkToggleBtn');
  const addBookmarkBtn = document.getElementById('addBookmarkBtn');
  const bookmarksPanel = document.getElementById('bookmarksPanel');
  const bookmarkListContainer = document.getElementById('bookmarkListContainer');
  const clearAllBtn = document.getElementById('clearAllBookmarksBtn');
  const toastEl = document.getElementById('toast');
  const panelCounterBadge = document.getElementById('panelCounterBadge');

  // ========== BUILD PANELS ==========
  function buildPanels() {
    allPanels = [];
    stories.forEach((story, idx) => {
      allPanels.push({
        type: 'image',
        storyId: story.id,
        title: story.title,
        subtitle: story.subtitle,
        image: story.image,
        chapterIndex: idx
      });
      
      const div = document.createElement('div');
      div.innerHTML = story.content;
      div.querySelectorAll('p, .speech-bubble, .moral-box').forEach(el => {
        allPanels.push({
          type: 'content',
          storyId: story.id,
          html: el.outerHTML,
          className: el.className,
          chapterIndex: idx
        });
      });
    });
  }

  function renderPanel() {
    if (!allPanels.length) return;
    if (currentPanelIndex < 0) currentPanelIndex = 0;
    if (currentPanelIndex >= allPanels.length) currentPanelIndex = allPanels.length - 1;

    const panel = allPanels[currentPanelIndex];
    panelDisplay.className = 'panel-display';

    if (panel.type === 'image') {
      panelDisplay.classList.add('image-panel');
      panelDisplay.innerHTML = `
        <img src="${panel.image}" alt="${panel.title}" onerror="this.style.display='none'; this.nextElementSibling.style.position='relative';">
        <div class="image-overlay">
          <h1>${panel.title}</h1>
          <h3>${panel.subtitle}</h3>
        </div>
      `;
    } else {
      panelDisplay.classList.add('content-panel');
      panelDisplay.innerHTML = panel.html;
    }

    if (panel.chapterIndex !== undefined) {
      chapterSelect.value = panel.storyId;
    }

    const total = allPanels.length;
    const percent = ((currentPanelIndex + 1) / total) * 100;
    progressFill.style.width = `${percent}%`;
    panelIndicator.textContent = `${currentPanelIndex + 1} / ${total}`;
    panelCounterBadge.textContent = `${currentPanelIndex + 1} / ${total}`;

    prevBtn.disabled = currentPanelIndex === 0;
    nextBtn.disabled = currentPanelIndex === total - 1;

    // Reset scroll position for new content
    if (panel.type === 'content') {
      panelDisplay.scrollTop = 0;
    }
  }

  function goToPanel(delta) {
    const newIndex = currentPanelIndex + delta;
    if (newIndex >= 0 && newIndex < allPanels.length) {
      currentPanelIndex = newIndex;
      renderPanel();
    }
  }

  function jumpToStory(storyId) {
    const firstPanel = allPanels.findIndex(p => p.storyId === storyId);
    if (firstPanel !== -1) {
      currentPanelIndex = firstPanel;
      renderPanel();
    }
  }

  // ========== BOOKMARKS ==========
  function saveBookmarksToStorage() {
    localStorage.setItem('gizmoDarkBookmarksEN', JSON.stringify(bookmarks));
  }

  function addBookmark() {
    const panel = allPanels[currentPanelIndex];
    if (!panel) return;
    const exists = bookmarks.some(b => b.storyId === panel.storyId && b.panelIndex === currentPanelIndex);
    if (exists) {
      showToast('⚠️ Already bookmarked');
      return;
    }
    bookmarks.push({
      id: Date.now(),
      storyId: panel.storyId,
      title: stories.find(s=>s.id===panel.storyId)?.title || '',
      panelIndex: currentPanelIndex,
      date: new Date().toLocaleString('en-US')
    });
    saveBookmarksToStorage();
    renderBookmarks();
    showToast('🔖 Bookmark added');
  }

  function deleteBookmark(id, e) {
    if (e) e.stopPropagation();
    bookmarks = bookmarks.filter(b => b.id !== id);
    saveBookmarksToStorage();
    renderBookmarks();
    showToast('Bookmark removed');
  }

  function clearAllBookmarks() {
    if (bookmarks.length === 0) return;
    bookmarks = [];
    saveBookmarksToStorage();
    renderBookmarks();
    showToast('All bookmarks cleared');
  }

  function loadBookmark(bookmark) {
    if (bookmark.panelIndex !== undefined && bookmark.panelIndex < allPanels.length) {
      currentPanelIndex = bookmark.panelIndex;
      renderPanel();
    }
    bookmarksPanel.classList.remove('open');
  }

  function renderBookmarks() {
    if (!bookmarkListContainer) return;
    if (bookmarks.length === 0) {
      bookmarkListContainer.innerHTML = '<p style="color:#777; text-align:center; padding:20px;">No bookmarks yet.</p>';
      return;
    }
    bookmarkListContainer.innerHTML = bookmarks.map(b => `
      <div class="bookmark-item" data-id="${b.id}">
        <button class="delete-bookmark"><i class="fas fa-times"></i></button>
        <strong>${b.title}</strong>
        <small>📅 ${b.date}</small>
      </div>
    `).join('');

    document.querySelectorAll('.bookmark-item').forEach(item => {
      const id = parseInt(item.dataset.id);
      item.addEventListener('click', (e) => {
        if (e.target.closest('.delete-bookmark')) return;
        const bm = bookmarks.find(b => b.id === id);
        if (bm) loadBookmark(bm);
      });
      item.querySelector('.delete-bookmark').addEventListener('click', (e) => deleteBookmark(id, e));
    });
  }

  function toggleBookmarksPanel() {
    bookmarksPanel.classList.toggle('open');
  }

  function showToast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add('show');
    clearTimeout(window.toastTimer);
    window.toastTimer = setTimeout(() => toastEl.classList.remove('show'), 2200);
  }

  function enterFullscreen() {
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      document.documentElement.requestFullscreen().catch(() => showToast('Fullscreen not supported'));
    }
  }

  function shareCurrent() {
    const panel = allPanels[currentPanelIndex];
    const story = stories.find(s=>s.id===panel.storyId);
    const url = window.location.href.split('?')[0] + `?story=${panel.storyId}&panel=${currentPanelIndex}`;
    if (navigator.share) {
      navigator.share({ title: story?.title || 'Gizmo', text: 'Check out this Gizmo comic!', url });
    } else {
      navigator.clipboard.writeText(url).then(() => showToast('📋 Link copied'));
    }
  }

  // ========== THE GIZMO BUTTON ==========
  const gizmoButton = document.getElementById('gizmoButton');
  const gizmoCounter = document.getElementById('gizmoCounter');
  const quotePopup = document.getElementById('quotePopup');

  let pushCount = parseInt(localStorage.getItem('gizmoButtonPushes') || '0');

  const gizmOQuotes = [
    "Oops! Did I just break reality... again?",
    "I swear this never happens! ...Okay, it happens a LOT.",
    "Papa Hawk is going to need more coffee.",
    "The pancakes send their regards.",
    "That wasn't supposed to happen. Probably.",
    "I regret nothing! ...Well, maybe the spaghetti thing.",
    "Did someone say 'chaos'? No? Just me?",
    "My bad! ...Said Gizmo, for the 47th time today.",
    "Science is about pressing buttons! ALL buttons!",
    "If it's not broken, you're not trying hard enough!",
    "I fixed it! ...Sort of. ...Define 'fixed'.",
    "The socks told me to do it.",
    "In my defense, the button was asking for it.",
    "I've made a huge tiny mistake.",
    "Quick! Act natural! ...What's natural?",
    "The toaster agrees with me. Probably.",
    "Calculated risk! ...Very poorly calculated.",
    "I'm 60% sure this is safe!",
    "Pedi! Bring the fire extinguisher!",
    "Baby Hawk said it was a bad idea. I listened. Then I did it anyway."
  ];

  // ========== GIZMO'S RANDOM FIX LINES ==========
  const gizmOFixLines = [
    { face: '😈', lines: [
      "See? I TOLD you not to push that button.",
      "You never listen, do you?",
      "Every. Single. Time.",
      "When will you learn?",
      "I warned you. I really did."
    ]},
    { face: '😏', lines: [
      "But you just HAD to, didn't you?",
      "Curiosity killed the website.",
      "You're addicted to chaos, admit it.",
      "Nobody can resist the button.",
      "It's not your fault. The button is irresistible."
    ]},
    { face: '😇', lines: [
      "Fine. I'll fix it. This ONE time.",
      "Okay okay, I'll clean up my mess.",
      "Lucky for you, I'm feeling generous.",
      "I'll put everything back. Maybe.",
      "Fine. But you owe me pizza."
    ]},
    { face: '😌', lines: [
      "You're lucky I'm in a good mood today.",
      "Next time, I might not be so nice.",
      "Consider this a free pass.",
      "Don't get used to this treatment.",
      "I'm only doing this because it's Tuesday."
    ]},
    { face: '😈', lines: [
      "Don't do it again. (...Do it again.)",
      "I better not see you push that button again. (Push it.)",
      "Learn your lesson. (Don't learn.)",
      "This never happened. (It totally happened.)",
      "We shall never speak of this. (Tell everyone.)"
    ]}
  ];

  function getRandomLine(category) {
    const cat = gizmOFixLines.find(c => c.face === category);
    if (cat) {
      return cat.lines[Math.floor(Math.random() * cat.lines.length)];
    }
    return "Fine. I'll fix it.";
  }

  const confettiItems = ['🍕', '🧦', '🥞', '👗', '🍝', '🧈', '☕', '🧹', '🍩', '🎩', '🧤', '💥', '✨', '🔥', '🌀', '👀'];

  function updateCounter() {
    gizmoCounter.textContent = `Pushed ${pushCount} times. Gizmo is ${pushCount > 10 ? 'very' : pushCount > 5 ? 'quite' : ''} proud.`;
    localStorage.setItem('gizmoButtonPushes', pushCount.toString());
  }

  function createExplosion() {
    const particleCount = 25;
    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;
    
    for (let i = 0; i < particleCount; i++) {
      const particle = document.createElement('span');
      particle.className = 'confetti-particle';
      particle.textContent = confettiItems[Math.floor(Math.random() * confettiItems.length)];
      
      const angle = (Math.PI * 2 * i) / particleCount;
      const distance = 100 + Math.random() * 200;
      const x = Math.cos(angle) * distance;
      const y = Math.sin(angle) * distance;
      const rotation = (Math.random() - 0.5) * 720;
      
      particle.style.cssText = `
        position: fixed;
        left: ${centerX}px;
        top: ${centerY}px;
        --x: ${x}px;
        --y: ${y}px;
        --rotation: ${rotation}deg;
        z-index: 300;
        pointer-events: none;
        animation: confettiBurst ${0.8 + Math.random() * 1}s ease-out forwards;
        animation-delay: ${Math.random() * 0.2}s;
      `;
      
      document.body.appendChild(particle);
      setTimeout(() => particle.remove(), 1500 + Math.random() * 500);
    }
  }

  function showQuote() {
    const randomQuote = gizmOQuotes[Math.floor(Math.random() * gizmOQuotes.length)];
    quotePopup.textContent = `"${randomQuote}" — Gizmo`;
    quotePopup.className = 'quote-popup show';
    setTimeout(() => { quotePopup.className = 'quote-popup hide'; }, 4000);
  }

  function screenShake() {
    document.body.classList.add('earthquake');
    setTimeout(() => document.body.classList.remove('earthquake'), 400);
  }

  // ========== CHAOS METER ==========
  const chaosMeterFill = document.getElementById('chaosMeterFill');
  const chaosPercentage = document.getElementById('chaosPercentage');
  const chaosStatus = document.getElementById('chaosStatus');
  const chaosLabel = document.getElementById('chaosLabel');
  const chaosBubbles = document.getElementById('chaosBubbles');

  let chaosLevel = parseInt(localStorage.getItem('gizmoChaosLevel') || '0');

  const statusMessages = {
    0: "Gizmo is asleep... for now.",
    10: "Gizmo is waking up...",
    20: "Gizmo is stretching...",
    30: "Gizmo has ideas...",
    40: "Gizmo is tinkering...",
    50: "Gizmo found a screwdriver...",
    60: "Gizmo is ignoring warnings...",
    70: "Gizmo is pressing buttons...",
    80: "Papa Hawk is getting nervous...",
    90: "EVERYBODY RUN!",
    100: "MAXIMUM CHAOS!"
  };

  const labelStyles = {
    calm: { text: '😌 Calm', color: '#4ecdc4' },
    warming: { text: '😏 Warming Up', color: '#f39c12' },
    chaos: { text: '😈 CHAOS!', color: '#e74c3c' },
    maximum: { text: '💀 MAXIMUM!', color: '#e94560' }
  };

  function updateChaosMeter() {
    chaosMeterFill.style.height = chaosLevel + '%';
    chaosPercentage.textContent = chaosLevel + '%';
    
    chaosMeterFill.className = 'chaos-meter-fill';
    if (chaosLevel >= 40 && chaosLevel < 70) chaosMeterFill.classList.add('medium');
    else if (chaosLevel >= 70 && chaosLevel < 100) chaosMeterFill.classList.add('high');
    else if (chaosLevel >= 100) chaosMeterFill.classList.add('maximum');
    
    if (chaosLevel < 30) {
      chaosLabel.textContent = labelStyles.calm.text;
      chaosLabel.style.color = labelStyles.calm.color;
    } else if (chaosLevel < 60) {
      chaosLabel.textContent = labelStyles.warming.text;
      chaosLabel.style.color = labelStyles.warming.color;
    } else if (chaosLevel < 100) {
      chaosLabel.textContent = labelStyles.chaos.text;
      chaosLabel.style.color = labelStyles.chaos.color;
    } else {
      chaosLabel.textContent = labelStyles.maximum.text;
      chaosLabel.style.color = labelStyles.maximum.color;
    }
    
    chaosStatus.textContent = statusMessages[chaosLevel] || `Chaos: ${chaosLevel}%`;
    localStorage.setItem('gizmoChaosLevel', chaosLevel.toString());
  }

  function addBubbles() {
    for (let i = 0; i < 5; i++) {
      const bubble = document.createElement('div');
      bubble.className = 'chaos-bubble';
      const size = 3 + Math.random() * 6;
      bubble.style.width = size + 'px';
      bubble.style.height = size + 'px';
      bubble.style.left = Math.random() * 80 + '%';
      chaosBubbles.appendChild(bubble);
      setTimeout(() => bubble.remove(), 1500);
    }
  }

  function increaseChaos() {
    if (chaosLevel < 100) {
      chaosLevel = Math.min(100, chaosLevel + 10);
      updateChaosMeter();
      addBubbles();
    }
    if (chaosLevel === 100) {
      setTimeout(() => triggerSystemCrash(), 500);
    }
  }

  // ========== SYSTEM CRASH - PAGE GOES CRAZY ==========
  function triggerSystemCrash() {
    document.body.classList.add('earthquake');
    setTimeout(() => document.body.classList.remove('earthquake'), 600);

    setTimeout(() => {
      
      const everything = document.querySelectorAll('.toolbar, .panel-display, .panel-navigation, .gizmo-button-container, .chaos-meter-container, .bookmarks-panel');
      const allText = document.querySelectorAll('.content-panel p, .speech-bubble, .moral-box, .image-overlay h1, .image-overlay h3');
      const allButtons = document.querySelectorAll('.icon-btn, .nav-btn, .gizmo-button');
      
      everything.forEach((el) => {
        el.style.transition = 'all 2s cubic-bezier(0.68, -0.55, 0.27, 1.55)';
        el.style.transform = `rotate(${(Math.random() - 0.5) * 30}deg) translateX(${(Math.random() - 0.5) * 40}px) translateY(${(Math.random() - 0.5) * 30}px) scale(${0.8 + Math.random() * 0.4})`;
        el.style.filter = `hue-rotate(${Math.random() * 180}deg) blur(${Math.random() * 2}px)`;
      });
      
      allText.forEach((el) => {
        el.style.transition = 'all 1.5s ease';
        el.style.transform = `rotate(${(Math.random() - 0.5) * 15}deg) skewX(${(Math.random() - 0.5) * 10}deg)`;
        el.style.color = ['#e94560', '#f0c040', '#ff6b81', '#4ecdc4'][Math.floor(Math.random() * 4)];
        el.style.textShadow = '0 0 15px currentColor';
        el.style.letterSpacing = `${Math.random() * 5}px`;
      });
      
      allButtons.forEach((btn) => {
        btn.style.transition = 'all 1.2s ease';
        btn.style.transform = `rotate(${(Math.random() - 0.5) * 60}deg) scale(${0.7 + Math.random() * 0.6})`;
        btn.style.background = ['#e94560', '#f0c040', '#ff6b81', '#333'][Math.floor(Math.random() * 4)];
        btn.style.borderRadius = Math.random() > 0.5 ? '50%' : '10px';
      });
      
      const panelChangeInterval = setInterval(() => {
        goToPanel(Math.random() > 0.5 ? 1 : -1);
      }, 800);

      // ===== GIZMO APPEARS =====
      setTimeout(() => {
        clearInterval(panelChangeInterval);
        document.body.style.animation = '';
        
        const overlay = document.createElement('div');
        overlay.style.cssText = `
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.85);
          z-index: 1000;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 15px;
          opacity: 0;
          transition: opacity 0.5s ease;
        `;
        document.body.appendChild(overlay);
        setTimeout(() => { overlay.style.opacity = '1'; }, 100);

        const face = document.createElement('div');
        face.textContent = '😈';
        face.style.cssText = `
          font-size: 5rem;
          animation: gizmoPop 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
          filter: drop-shadow(0 0 30px #e94560);
        `;
        overlay.appendChild(face);

        const msg = document.createElement('div');
        msg.style.cssText = `
          font-size: clamp(1rem, 1.5vw, 1.3rem);
          color: #fadf9e;
          font-family: 'Georgia', serif;
          font-style: italic;
          text-shadow: 0 0 15px rgba(240, 192, 64, 0.6);
          text-align: center;
          max-width: 80vw;
          opacity: 0;
          transition: opacity 0.5s ease;
        `;
        overlay.appendChild(msg);
        
        // خط اول - رندوم
        const line1 = getRandomLine('😈');
        setTimeout(() => {
          msg.textContent = line1;
          msg.style.opacity = '1';
        }, 500);

        // خط دوم - رندوم
        setTimeout(() => {
          msg.style.opacity = '0';
          setTimeout(() => {
            face.textContent = '😏';
            msg.textContent = getRandomLine('😏');
            msg.style.opacity = '1';
          }, 300);
        }, 2200);

        // خط سوم - رندوم
        setTimeout(() => {
          msg.style.opacity = '0';
          setTimeout(() => {
            face.textContent = '😇';
            msg.textContent = getRandomLine('😇');
            msg.style.opacity = '1';
            msg.style.color = '#4ecdc4';
          }, 300);
        }, 4400);

        // خط چهارم - رندوم
        setTimeout(() => {
          msg.style.opacity = '0';
          setTimeout(() => {
            face.textContent = '😌';
            msg.textContent = getRandomLine('😌');
            msg.style.opacity = '1';
          }, 300);
        }, 6600);

        // ===== FIX EVERYTHING =====
        setTimeout(() => {
          overlay.style.opacity = '0';
          overlay.style.transition = 'opacity 0.8s ease';
          
          everything.forEach(el => {
            el.style.transition = 'all 0.6s ease';
            el.style.transform = '';
            el.style.filter = '';
          });
          
          allText.forEach(el => {
            el.style.transition = 'all 0.5s ease';
            el.style.transform = '';
            el.style.color = '';
            el.style.textShadow = '';
            el.style.letterSpacing = '';
          });
          
          allButtons.forEach(btn => {
            btn.style.transition = 'all 0.5s ease';
            btn.style.transform = '';
            btn.style.background = '';
            btn.style.borderRadius = '';
          });
          
          setTimeout(() => {
            overlay.remove();
            chaosLevel = 0;
            updateChaosMeter();
            jumpToStory('foreword');
            
            const finalLine = getRandomLine('😈');
            const finalMessage = document.getElementById('quotePopup');
            finalMessage.textContent = `"${finalLine}" — Gizmo`;
            finalMessage.className = 'quote-popup show';
            finalMessage.style.color = '#fadf9e';
            finalMessage.style.textShadow = '0 0 20px rgba(240, 192, 64, 0.8)';
            setTimeout(() => {
              finalMessage.className = 'quote-popup hide';
              finalMessage.style.color = '#fadf9e';
              finalMessage.style.textShadow = '';
            }, 5000);
          }, 600);
          
        }, 9000);

      }, 3500);

    }, 500);
  }

  // ========== GIZMO BUTTON CLICK ==========
  function handleGizmoButtonClick() {
    pushCount++;
    updateCounter();
    screenShake();
    createExplosion();
    showQuote();
    increaseChaos();
    
    gizmoButton.style.transform = 'scale(0.8)';
    gizmoButton.style.background = '#ff6b81';
    setTimeout(() => {
      gizmoButton.style.transform = '';
      gizmoButton.style.background = '';
    }, 200);
  }

  // ========== PREVENT DOUBLE-TAP ZOOM (mobile) ==========
  let lastTouchEnd = 0;
  document.addEventListener('touchend', (e) => {
    const now = Date.now();
    if (now - lastTouchEnd <= 300) {
      // Only block if it's not inside the scrollable content area
      if (!e.target.closest('.content-panel, .bookmark-list, .content-panel p')) {
        e.preventDefault();
      }
    }
    lastTouchEnd = now;
  }, { passive: false });

  // Block iOS pinch-zoom gesture
  document.addEventListener('gesturestart', (e) => {
    e.preventDefault();
  }, { passive: false });

  // Block desktop/iPad double-click zoom
  document.addEventListener('dblclick', (e) => {
    if (!e.target.closest('.content-panel, .bookmark-list')) {
      e.preventDefault();
    }
  }, { passive: false });

  // ========== EVENT LISTENERS ==========
  document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') { e.preventDefault(); goToPanel(1); }
    else if (e.key === 'ArrowLeft') { e.preventDefault(); goToPanel(-1); }
    else if (e.key === 'b' && e.ctrlKey) { e.preventDefault(); toggleBookmarksPanel(); }
    else if (e.key === 'd' && e.ctrlKey) { e.preventDefault(); addBookmark(); }
    else if (e.key === 'g' && e.ctrlKey && e.shiftKey) { e.preventDefault(); handleGizmoButtonClick(); }
  });

  // ========== SWIPE NAVIGATION ==========
  let touchStartX = 0;
  let touchStartY = 0;
  let touchStartTime = 0;

  document.addEventListener('touchstart', (e) => {
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
    touchStartTime = Date.now();
  }, { passive: true });

  document.addEventListener('touchend', (e) => {
    const touchEndX = e.changedTouches[0].clientX;
    const touchEndY = e.changedTouches[0].clientY;
    const diffX = touchStartX - touchEndX;
    const diffY = touchStartY - touchEndY;
    const timeDiff = Date.now() - touchStartTime;

    // Only treat as swipe if:
    // - horizontal movement > 50px
    // - vertical movement < 60px (not a scroll)
    // - quick gesture (< 500ms)
    // - not touching an interactive element
    if (Math.abs(diffX) > 50 &&
        Math.abs(diffY) < 60 &&
        timeDiff < 500 &&
        !e.target.closest('button, a, select, input, .bookmark-item, .gizmo-button')) {
      if (diffX > 0) goToPanel(1);   // swipe left → next
      else goToPanel(-1);             // swipe right → previous
    }
  }, { passive: true });

  prevBtn.addEventListener('click', () => goToPanel(-1));
  nextBtn.addEventListener('click', () => goToPanel(1));
  chapterSelect.addEventListener('change', (e) => jumpToStory(e.target.value));
  bookmarkToggleBtn.addEventListener('click', toggleBookmarksPanel);
  addBookmarkBtn.addEventListener('click', addBookmark);
  document.getElementById('fullscreenBtn').addEventListener('click', enterFullscreen);
  document.getElementById('shareBtn').addEventListener('click', shareCurrent);
  clearAllBtn.addEventListener('click', clearAllBookmarks);
  gizmoButton.addEventListener('click', handleGizmoButtonClick);

  // Close bookmarks panel when tapping outside
  document.addEventListener('click', (e) => {
    if (bookmarksPanel.classList.contains('open') &&
        !bookmarksPanel.contains(e.target) &&
        !bookmarkToggleBtn.contains(e.target)) {
      bookmarksPanel.classList.remove('open');
    }
  });

  // ========== INITIALIZATION ==========
  buildPanels();
  renderPanel();
  renderBookmarks();
  updateCounter();
  updateChaosMeter();

  const params = new URLSearchParams(window.location.search);
  const storyParam = params.get('story');
  const panelParam = params.get('panel');
  if (storyParam) jumpToStory(storyParam);
  if (panelParam && !isNaN(parseInt(panelParam))) {
    currentPanelIndex = parseInt(panelParam);
    if (currentPanelIndex < allPanels.length) renderPanel();
  }
})();