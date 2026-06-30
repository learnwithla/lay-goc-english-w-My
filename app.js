// App logic for Simple English Practice.
// Data is loaded from data/vocab-data.js and data/practice-data.js.

const $ = id => document.getElementById(id);
    const escapeHTML = s => String(s ?? '').replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
    function setRoute(route) {
      document.querySelectorAll('.view').forEach(v => v.classList.toggle('active', v.id === route));
      document.querySelectorAll('[data-route]').forEach(b => b.classList.toggle('active', b.dataset.route === route));
      location.hash = route;
      window.scrollTo({top:0, behavior:'smooth'});
    }
    document.querySelectorAll('[data-route]').forEach(el => el.addEventListener('click', () => setRoute(el.dataset.route)));
    window.addEventListener('hashchange', () => { const r = location.hash.replace('#','') || 'home'; if(['home','vocab','practice'].includes(r)) setRoute(r); });
    if (location.hash) { const r = location.hash.replace('#',''); if(['home','vocab','practice'].includes(r)) setRoute(r); }

    const topics = [...new Map(VOCAB_DATA.map(x => [x.section, x.topic])).entries()].sort((a,b)=>a[0]-b[0]);
    const vocabState = { index:0, revealed:false, items:[...VOCAB_DATA] };
    function populateVocabSections() {
      $('vocabSection').innerHTML = '<option value="all">Tất cả chủ đề</option>' + topics.map(([num, topic]) => `<option value="${num}">${num}. ${escapeHTML(topic)}</option>`).join('');
    }
    function currentVocabList() {
      const section = $('vocabSection').value;
      const q = $('vocabSearch').value.trim().toLowerCase();
      return VOCAB_DATA.filter(item => {
        const sectionOK = section === 'all' || item.section === Number(section);
        const text = `${item.term} ${item.vi} ${item.phonetic} ${item.topic} ${item.pos}`.toLowerCase();
        return sectionOK && (!q || text.includes(q));
      });
    }
    function filterVocab() { vocabState.items = currentVocabList(); vocabState.index=0; vocabState.revealed=false; renderVocab(); }
    function vocabProgress() { return vocabState.items.length ? ((vocabState.index+1)/vocabState.items.length)*100 : 0; }
    function renderVocab() {
      const items = vocabState.items;
      $('vocabCount').textContent = items.length ? `${vocabState.index+1} / ${items.length} thẻ` : '0 thẻ';
      $('vocabBar').style.width = vocabProgress() + '%';
      if (!items.length) { $('flashCard').innerHTML = '<div class="empty">Không có thẻ nào khớp với bộ lọc này.</div>'; return; }
      const item = items[vocabState.index];
      if (!vocabState.revealed) {
        $('flashCard').innerHTML = `<div><div class="week-tag">#${item.id} • ${item.section}. ${escapeHTML(item.topic)} • ${escapeHTML(item.pos)}</div><p class="term">${escapeHTML(item.term)}</p><p class="card-phonetic">${escapeHTML(item.phonetic)}</p><p class="hint">Bấm vào thẻ hoặc nhấn phím Space để xem nghĩa tiếng Việt.</p></div>`;
        $('vocabFlip').textContent = 'Xem nghĩa tiếng Việt';
      } else {
        $('flashCard').innerHTML = `<div><div class="week-tag">#${item.id} • ${item.section}. ${escapeHTML(item.topic)}</div><p class="vi">${escapeHTML(item.vi)}</p><p class="small-info"><strong>${escapeHTML(item.term)}</strong><br>${escapeHTML(item.phonetic)} • ${escapeHTML(item.pos)}</p><p class="hint">Bấm lại để ẩn nghĩa tiếng Việt.</p></div>`;
        $('vocabFlip').textContent = 'Ẩn nghĩa tiếng Việt';
      }
    }
    function vocabNext() { if(!vocabState.items.length) return; vocabState.index=(vocabState.index+1)%vocabState.items.length; vocabState.revealed=false; renderVocab(); }
    function vocabPrev() { if(!vocabState.items.length) return; vocabState.index=(vocabState.index-1+vocabState.items.length)%vocabState.items.length; vocabState.revealed=false; renderVocab(); }
    function vocabToggle() { if(!vocabState.items.length) return; vocabState.revealed=!vocabState.revealed; renderVocab(); }
    function vocabShuffle() { if(vocabState.items.length<2) return; let idx=Math.floor(Math.random()*vocabState.items.length); if(idx===vocabState.index) idx=(idx+1)%vocabState.items.length; vocabState.index=idx; vocabState.revealed=false; renderVocab(); }
    populateVocabSections();
    $('vocabSection').addEventListener('input', filterVocab); $('vocabSearch').addEventListener('input', filterVocab);
    $('flashCard').addEventListener('click', vocabToggle); $('vocabFlip').addEventListener('click', vocabToggle); $('vocabNext').addEventListener('click', vocabNext); $('vocabPrev').addEventListener('click', vocabPrev); $('vocabShuffle').addEventListener('click', vocabShuffle);

    const practiceState = { index:0, items:[...PRACTICE_DATA], revealed:false, selected:null, shuffled:false };
    function populatePracticeSets() {
      const sets = Math.ceil(PRACTICE_DATA.length / 100);
      $('practiceSet').innerHTML = '<option value="all">Tất cả bộ câu hỏi</option>' + Array.from({length:sets}, (_,i)=>`<option value="${i+1}">Bộ ${i+1} — Câu ${i*100+1}-${Math.min((i+1)*100,PRACTICE_DATA.length)}</option>`).join('');
    }
    function currentPracticeList() {
      const set = $('practiceSet').value;
      const q = $('practiceSearch').value.trim().toLowerCase();
      return PRACTICE_DATA.filter(item => {
        const setOK = set === 'all' || item.set === Number(set);
        const text = `${item.id} ${item.prompt} ${item.original_prompt} ${item.A} ${item.B} ${item.C} ${item.answer_text}`.toLowerCase();
        return setOK && (!q || text.includes(q));
      });
    }
    function filterPractice() { practiceState.items=currentPracticeList(); practiceState.index=0; practiceState.revealed=false; practiceState.selected=null; practiceState.shuffled=false; renderPractice(); }
    function practiceProgress() { return practiceState.items.length ? ((practiceState.index+1)/practiceState.items.length)*100 : 0; }
    function renderPractice() {
      const items = practiceState.items;
      $('practiceCount').textContent = items.length ? `${practiceState.index+1} / ${items.length} câu` : '0 câu';
      $('practiceBar').style.width = practiceProgress() + '%';
      if(!items.length) { $('practiceCard').innerHTML = '<div class="empty">Không có câu hỏi nào khớp với bộ lọc này.</div>'; return; }
      const item = items[practiceState.index];
      const show = practiceState.revealed || practiceState.selected;
      const optionHTML = ['A','B','C'].map(letter => {
        let cls='answer';
        if(show) {
          if(letter === item.answer) cls += ' correct';
          else if(letter === practiceState.selected) cls += ' wrong';
          else cls += ' muted';
        }
        return `<button class="${cls}" data-answer="${letter}"><span class="letter">${letter}</span><span>${escapeHTML(item[letter])}</span></button>`;
      }).join('');
      const result = show ? `<div class="result"><strong>Đáp án: ${item.answer} — ${escapeHTML(item.answer_text)}</strong><br>Đọc lại cả câu hỏi và đáp án đúng thành tiếng một lần.</div>` : '';
      $('practiceCard').innerHTML = `<div><div class="week-tag">Câu ${item.id} • Bộ ${item.set}</div><p class="question">${escapeHTML(item.prompt)}</p><div class="answers">${optionHTML}</div>${result}</div>`;
      document.querySelectorAll('.answer').forEach(btn => btn.addEventListener('click', () => { practiceState.selected = btn.dataset.answer; practiceState.revealed=true; renderPractice(); }));
      $('practiceReveal').textContent = show ? 'Ẩn đáp án' : 'Xem đáp án';
    }
    function practiceNext() { if(!practiceState.items.length) return; practiceState.index=(practiceState.index+1)%practiceState.items.length; practiceState.revealed=false; practiceState.selected=null; renderPractice(); }
    function practicePrev() { if(!practiceState.items.length) return; practiceState.index=(practiceState.index-1+practiceState.items.length)%practiceState.items.length; practiceState.revealed=false; practiceState.selected=null; renderPractice(); }
    function practiceToggle() { if(!practiceState.items.length) return; practiceState.revealed=!practiceState.revealed; practiceState.selected=null; renderPractice(); }
    function shuffleArray(arr) { const copy=[...arr]; for(let i=copy.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [copy[i],copy[j]]=[copy[j],copy[i]]; } return copy; }
    function practiceShuffle() { practiceState.items=shuffleArray(currentPracticeList()); practiceState.index=0; practiceState.revealed=false; practiceState.selected=null; practiceState.shuffled=true; renderPractice(); }
    function practiceReset() { practiceState.items=currentPracticeList(); practiceState.index=0; practiceState.revealed=false; practiceState.selected=null; practiceState.shuffled=false; renderPractice(); }
    populatePracticeSets();
    $('practiceSet').addEventListener('input', filterPractice); $('practiceSearch').addEventListener('input', filterPractice);
    $('practiceReveal').addEventListener('click', practiceToggle); $('practiceNext').addEventListener('click', practiceNext); $('practicePrev').addEventListener('click', practicePrev); $('practiceShuffle').addEventListener('click', practiceShuffle); $('practiceReset').addEventListener('click', practiceReset);
    document.addEventListener('keydown', e => {
      const tag = document.activeElement.tagName;
      if(['INPUT','SELECT','TEXTAREA'].includes(tag)) return;
      const active = document.querySelector('.view.active')?.id;
      if(e.key==='ArrowRight') active==='vocab' ? vocabNext() : active==='practice' ? practiceNext() : null;
      if(e.key==='ArrowLeft') active==='vocab' ? vocabPrev() : active==='practice' ? practicePrev() : null;
      if(e.code==='Space') { e.preventDefault(); active==='vocab' ? vocabToggle() : active==='practice' ? practiceToggle() : null; }
    });
    renderVocab(); renderPractice();
