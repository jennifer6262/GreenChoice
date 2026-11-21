const loggedOutActions = document.querySelector('#loggedOutActions');
const loggedInActions = document.querySelector('#loggedInActions');
const loginButton = document.querySelector('#loginButton');
const signupButton = document.querySelector('#signupButton');
const historyButton = document.querySelector('#historyButton');
const ledgerButton = document.querySelector('#ledgerButton');
const historyModal = document.querySelector('#historyModal');
const ledgerModal = document.querySelector('#ledgerModal');
const ledgerForm = document.querySelector('#ledgerForm');
const ledgerBalance = document.querySelector('#ledgerBalance');
const ledgerBalanceCaption = document.querySelector('#ledgerBalanceCaption');
const ledgerWarning = document.querySelector('#ledgerWarning');
const ledgerIncomeTotal = document.querySelector('#ledgerIncomeTotal');
const ledgerExpenseTotal = document.querySelector('#ledgerExpenseTotal');
const ledgerEntries = document.querySelector('#ledgerEntries');
const ledgerEntryCount = document.querySelector('#ledgerEntryCount');
const ledgerMessage = document.querySelector('#ledgerMessage');
const ledgerSyncNotice = document.querySelector('#ledgerSyncNotice');
const historyList = document.querySelector('#historyList');
const historySyncNotice = document.createElement('p');
historySyncNotice.className = 'history-sync-notice';
historySyncNotice.setAttribute('role', 'status');
historySyncNotice.hidden = true;
historyList.before(historySyncNotice);
const historyDetailModal = document.querySelector('#historyDetailModal');
const historyDetailCopy = document.querySelector('#historyDetailCopy');
const historyDetailMessage = document.querySelector('#historyDetailMessage');
const badgeGrid = document.querySelector('#badgeGrid');
const badgeProgress = document.querySelector('#badgeProgress');
const badgeShareModal = document.querySelector('#badgeShareModal');
const badgeShareImage = document.querySelector('#badgeShareImage');
const badgeShareCopy = document.querySelector('#badgeShareCopy');
const nativeShareButton = document.querySelector('#nativeShareButton');
const savedMoney = document.querySelector('#savedMoney');
const savedCarbon = document.querySelector('#savedCarbon');
const monthlyAnalyses = document.querySelector('#monthlyAnalyses');
const aiRecommendedBought = document.querySelector('#aiRecommendedBought');
const aiFollowedAvoid = document.querySelector('#aiFollowedAvoid');
const aiIgnored = document.querySelector('#aiIgnored');
const guideRate = document.querySelector('#guideRate');
const guideCopy = document.querySelector('#guideCopy');
const purposeTotal = document.querySelector('#purposeTotal');
const purposeLegend = document.querySelector('#purposeLegend');
const carbonTrees = document.querySelector('#carbonTrees');
const carbonDetail = document.querySelector('#carbonDetail');
const carbonSavingsCard = savedCarbon.parentElement;
const savingsStats = carbonSavingsCard.parentElement;
savingsStats.classList.add('carbon-savings-layout');
carbonSavingsCard.classList.add('carbon-savings-stat');
carbonSavingsCard.querySelector('span').textContent = '감소한 탄소량 (추정)';
let carbonSavingsNote = carbonSavingsCard.querySelector('.carbon-savings-note');
if (!carbonSavingsNote) {
  carbonSavingsNote = makeTextElement('small', 'carbon-savings-note', '구매 보류 또는 중고 구매 기록을 표의 품목별 구매 1회 초기 탄소량으로 환산한 추정치예요. 실제 감축량은 아니에요.');
}
carbonSavingsCard.append(carbonSavingsNote);
let carbonEquivalent = carbonSavingsCard.querySelector('.carbon-equivalent-note');
if (!carbonEquivalent) {
  carbonEquivalent = document.createElement('div');
  carbonEquivalent.className = 'carbon-equivalent-note';
  carbonEquivalent.append(makeTextElement('small', 'carbon-equivalent-label', '같은 탄소량의 제품 생산 비교'), makeTextElement('strong', 'carbon-equivalent-value', '구매 보류 기록이 쌓이면 비교 결과를 보여드려요.'));
}
savingsStats.append(carbonEquivalent);
const budgetInput = document.querySelector('#budget');
const budgetImportButton = document.querySelector('#budgetImportButton');
const budgetImportMessage = document.querySelector('#budgetImportMessage');
let purposeChart = null;
const accountEmail = document.querySelector('#accountEmail');
const badgeCount = document.querySelector('#badgeCount');
const logoutButton = document.querySelector('#logoutButton');
const form = document.querySelector('#analysisForm');
const mockAnalysis = document.querySelector('#mockAnalysis');
const analyzeButtonLabel = form.querySelector('.analyze-button').firstChild;
const loadingCard = document.querySelector('#loadingCard');
const analysisProgressBar = document.querySelector('#analysisProgressBar');
const analysisProgressFill = document.querySelector('#analysisProgressFill');
const analysisProgressPercent = document.querySelector('#analysisProgressPercent');
const analysisProgressStage = document.querySelector('#analysisProgressStage');
const resetButton = document.querySelector('#resetButton');
const analysisResult = document.querySelector('#analysisResult');
const authModal = document.querySelector('#authModal');
const savePrompt = document.querySelector('#savePrompt');
const authForm = document.querySelector('#authForm');
const authMessage = document.querySelector('#authMessage');
const authSubmit = document.querySelector('#authSubmit');
const privacyConsentField = document.querySelector('#privacyConsentField');
const privacyConsent = document.querySelector('#privacyConsent');
const privacyModal = document.querySelector('#privacyModal');
const privacyAcceptLedger = document.querySelector('#privacyAcceptLedger');
const privacyAcceptMessage = document.querySelector('#privacyAcceptMessage');
const authTitle = document.querySelector('#authTitle');
let supabaseClient = null;
let supabaseSetupMessage = 'Supabase 연결 상태를 확인하고 있어요.';
let supabaseReadyPromise = null;
let currentUser = null;
let ledgerUsesLocalStorage = false;
let ledgerSyncMessage = '';
let authMode = 'login';
let pendingResult = null;
let pendingInput = null;
let pendingHistoryId = new URLSearchParams(window.location.search).get('history');
let currentReminderRecord = null;
let analysisProgressFrame = 0;
let analysisProgressStartedAt = 0;
let analysisProgressValue = 0;

const getValue = (name) => new FormData(form).get(name) || '';
const openModal = (modal) => { modal.hidden = false; document.body.classList.add('modal-open'); };
const closeModal = (modal) => { modal.hidden = true; if ([authModal, savePrompt].every((item) => item.hidden)) document.body.classList.remove('modal-open'); };

function setAuthMode(nextMode) {
  authMode = nextMode;
  document.querySelectorAll('.auth-tab').forEach((tab) => tab.classList.toggle('active', tab.dataset.authTab === nextMode));
  const signup = nextMode === 'signup';
  privacyConsentField.hidden = !signup;
  privacyConsent.required = signup;
  privacyConsent.checked = false;
  authSubmit.innerHTML = signup ? '회원가입하기 <span>→</span>' : '로그인하기 <span>→</span>';
  authTitle.innerHTML = signup ? '나에게 맞는 소비 습관을<br /><span>시작해요.</span>' : '내 소비 기록을<br /><span>안전하게 저장해요.</span>';
  authMessage.textContent = '';
}

function setAnalysisCount(count) {
  badgeCount.textContent = `분석 ${count}회`;
}

function setHistorySyncNotice(message = '') {
  historySyncNotice.textContent = message;
  historySyncNotice.hidden = !message;
}

function updateAccount(user) {
  currentUser = user;
  if (!user) {
    loggedOutActions.hidden = false;
    loggedInActions.hidden = true;
    return;
  }
  loggedOutActions.hidden = true;
  loggedInActions.hidden = false;
  accountEmail.textContent = user.email || '로그인 사용자';
  badgeCount.textContent = '분석 확인 중';
  fetchHistory().then((history) => {
    if (currentUser?.id === user.id) setAnalysisCount(history.length);
  }).catch(() => {
    if (currentUser?.id === user.id) setAnalysisCount(0);
  });
}

async function initSupabase() {
  try {
    const response = await fetch('/api/config');
    if (!response.ok) throw new Error('설정 응답 오류');
    const config = await response.json();
    if (!config.supabaseUrl) { supabaseSetupMessage = 'Supabase 프로젝트 URL이 서버 설정에 없어요.'; return; }
    if (!config.supabaseAnonKey) { supabaseSetupMessage = 'Supabase 공개 API 키가 서버 설정에 없어요.'; return; }
    if (!window.supabase) { supabaseSetupMessage = 'Supabase 인증 라이브러리를 불러오지 못했어요.'; return; }
    const projectUrl = new URL(config.supabaseUrl);
    projectUrl.pathname = projectUrl.pathname.replace(/\/rest\/v1\/?$/, '').replace(/\/+$/, '') || '/';
    supabaseClient = window.supabase.createClient(projectUrl.toString().replace(/\/$/, ''), config.supabaseAnonKey);
    const { data } = await supabaseClient.auth.getSession();
    updateAccount(data.session?.user || null);
    supabaseClient.auth.onAuthStateChange(async (_event, session) => { updateAccount(session?.user || null); if (session?.user && pendingHistoryId) await openHistoryDetail(pendingHistoryId); });
    supabaseSetupMessage = '';
    if (pendingHistoryId) { if (data.session?.user) await openHistoryDetail(pendingHistoryId); else openAuth('login'); }
  } catch { supabaseSetupMessage = 'Supabase 연결 설정을 확인하지 못했어요. 프로젝트 URL과 공개 API 키를 확인해 주세요.'; }
}

function openAuth(nextMode = 'login') { setAuthMode(nextMode); openModal(authModal); setTimeout(() => document.querySelector('#authEmail').focus(), 0); }

async function completeAuthentication(session) {
  updateAccount(session.user);
  closeModal(authModal);
  const history = await fetchHistory();
  setAnalysisCount(history.length);
  if (pendingResult) {
    const savedRecord = await saveAnalysisRecord(pendingResult, pendingInput);
    renderReminderAction(pendingResult, pendingInput, savedRecord);
    renderPurchaseDecision(pendingResult, pendingInput, savedRecord);
    pendingResult = null;
    pendingInput = null;
  }
  if (pendingHistoryId) await openHistoryDetail(pendingHistoryId);
}

loginButton.addEventListener('click', () => openAuth('login'));
signupButton.addEventListener('click', () => openAuth('signup'));
historyButton.addEventListener('click', async () => {
  if (!currentUser) { openAuth('login'); return; }
  openModal(historyModal);
  await renderHistory();
});
ledgerButton.addEventListener('click', async () => {
  if (!currentUser) { openAuth('login'); return; }
  if (currentUser.user_metadata?.privacy_policy_version !== '1.3') {
    privacyAcceptLedger.hidden = false;
    privacyAcceptMessage.textContent = '가계부 이용을 위해 변경된 개인정보처리방침을 확인하고 동의해 주세요.';
    openModal(privacyModal);
    return;
  }
  openModal(ledgerModal);
  await renderLedger();
});

document.querySelectorAll('[data-auth-tab]').forEach((tab) => tab.addEventListener('click', () => setAuthMode(tab.dataset.authTab)));
document.querySelectorAll('[data-close-modal]').forEach((button) => button.addEventListener('click', () => closeModal(document.querySelector(`#${button.dataset.closeModal}`))));
document.querySelector('#showPrivacyPolicy').addEventListener('click', () => {
  privacyAcceptLedger.hidden = true;
  privacyAcceptMessage.textContent = '';
  openModal(privacyModal);
});

privacyAcceptLedger.addEventListener('click', async () => {
  privacyAcceptLedger.disabled = true;
  privacyAcceptMessage.textContent = '동의 내용을 저장하고 있어요...';
  const { data, error } = await supabaseClient.auth.updateUser({ data: { privacy_consent: true, privacy_policy_version: '1.3', privacy_consented_at: new Date().toISOString() } });
  privacyAcceptLedger.disabled = false;
  if (error || !data.user) { privacyAcceptMessage.textContent = '동의를 저장하지 못했어요. 다시 시도해 주세요.'; return; }
  currentUser = data.user;
  privacyAcceptLedger.hidden = true;
  privacyAcceptMessage.textContent = '';
  closeModal(privacyModal);
  openModal(ledgerModal);
  await renderLedger();
});

authForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  authSubmit.disabled = true;
  try {
    await supabaseReadyPromise;
    if (!supabaseClient) { authMessage.textContent = supabaseSetupMessage; return; }
    authMessage.textContent = authMode === 'signup' ? '계정을 만들고 있어요...' : '로그인하고 있어요...';
    const email = document.querySelector('#authEmail').value.trim();
    const password = document.querySelector('#authPassword').value;
    if (authMode === 'signup') {
      const result = await supabaseClient.auth.signUp({
        email,
        password,
        options: {
          data: {
            privacy_consent: true,
            privacy_policy_version: '1.3',
            privacy_consented_at: new Date().toISOString()
          }
        }
      });
      if (result.error) {
        const message = result.error.message.toLowerCase();
        authMessage.textContent = message.includes('rate limit') || message.includes('too many requests')
          ? 'Supabase 이메일 발송 한도에 도달했어요. 잠시 기다렸다가 다시 시도해 주세요. Supabase 대시보드에서 Email의 Confirm email이 꺼져 있는지, 올바른 프로젝트를 수정했는지도 확인해 주세요.'
          : message.includes('already registered')
            ? '이미 가입된 이메일이에요. 로그인해 주세요.'
            : message.includes('redirect')
              ? 'Supabase Auth URL 설정에 현재 사이트 주소를 허용해 주세요.'
              : result.error.message;
        return;
      }
      let session = result.data.session;
      if (!session) {
        const currentSession = await supabaseClient.auth.getSession();
        session = currentSession.data.session;
        if (!session) {
          const loginResult = await supabaseClient.auth.signInWithPassword({ email, password });
          if (loginResult.error || !loginResult.data.session) {
            const errorMessage = loginResult.error?.message.toLowerCase() || '';
            authMessage.textContent = errorMessage.includes('email not confirmed')
              ? 'Supabase가 아직 이메일 확인을 요구하고 있어요. 올바른 Supabase 프로젝트의 Authentication → Sign In / Providers → Email에서 Confirm email이 꺼져 있는지 확인해 주세요.'
              : '계정은 만들어졌지만 바로 로그인되지 않았어요. Supabase 프로젝트와 Email의 Confirm email 설정을 확인해 주세요.';
            return;
          }
          session = loginResult.data.session;
        }
      }
      await completeAuthentication(session);
      return;
    }
    const result = await supabaseClient.auth.signInWithPassword({ email, password });
    if (result.error) {
      const message = result.error.message.toLowerCase();
      authMessage.textContent = message.includes('already registered')
          ? '이미 가입된 이메일이에요. 로그인해 주세요.'
          : message.includes('rate limit') || message.includes('too many requests')
            ? 'Supabase에서 요청을 잠시 제한했어요. 조금 기다렸다가 다시 로그인해 주세요.'
          : message.includes('invalid login credentials')
            ? '이메일 또는 비밀번호를 확인해 주세요.'
            : message.includes('email not confirmed')
              ? 'Supabase에서 이메일 인증을 끈 뒤 다시 로그인해 주세요.'
            : message.includes('redirect')
              ? 'Supabase Auth URL 설정에 현재 사이트 주소를 허용해 주세요.'
            : result.error.message;
      return;
    }
    if (result.data.session) {
      authMessage.textContent = '로그인되었습니다.';
      await completeAuthentication(result.data.session);
    }
  } catch {
    authMessage.textContent = authMode === 'signup'
      ? '가입 요청을 처리하지 못했어요. Supabase Auth의 이메일 설정을 확인해 주세요.'
      : 'Supabase에 연결하지 못했어요. 프로젝트 URL, 공개 API 키와 Auth 설정을 확인해 주세요.';
  } finally {
    authSubmit.disabled = false;
  }
});

logoutButton.addEventListener('click', async () => { if (supabaseClient) await supabaseClient.auth.signOut(); });

document.querySelectorAll('input[name="reason"]').forEach((input) => input.addEventListener('change', () => document.querySelector('#otherPurpose').classList.toggle('visible', input.id === 'otherReason' && input.checked)));
mockAnalysis.addEventListener('change', () => {
  analyzeButtonLabel.textContent = mockAnalysis.checked ? '모의 분석 실행하기 ' : 'AI 합리성 & 환경 영향 분석하기 ';
});

function showError(message) { analysisResult.innerHTML = `<div class="result-error"><span>!</span><div><strong>분석을 잠시 멈췄어요.</strong><p>${message}</p></div></div>`; analysisResult.classList.add('visible'); analysisResult.setAttribute('aria-hidden', 'false'); }
function makeTextElement(tag, className, text) { const element = document.createElement(tag); element.className = className; element.textContent = text || '-'; return element; }

function setAnalysisProgress(value, stage) {
  analysisProgressValue = Math.max(0, Math.min(100, Math.round(value)));
  analysisProgressFill.style.width = `${analysisProgressValue}%`;
  analysisProgressBar.setAttribute('aria-valuenow', String(analysisProgressValue));
  analysisProgressPercent.textContent = `${analysisProgressValue}%`;
  analysisProgressStage.textContent = stage;
}

function animateAnalysisProgress(now) {
  const elapsed = now - analysisProgressStartedAt;
  const value = Math.min(92, 8 + elapsed / 220);
  const stage = value < 30 ? '입력한 소비 정보를 정리하고 있어요.' : value < 62 ? '예산과 구매 목적을 비교하고 있어요.' : '환경 영향과 대안을 정리하고 있어요.';
  if (value > analysisProgressValue) setAnalysisProgress(value, stage);
  analysisProgressFrame = requestAnimationFrame(animateAnalysisProgress);
}

function startAnalysisProgress() {
  cancelAnimationFrame(analysisProgressFrame);
  analysisProgressStartedAt = performance.now();
  setAnalysisProgress(5, '입력한 소비 정보를 정리하고 있어요.');
  analysisProgressFrame = requestAnimationFrame(animateAnalysisProgress);
}

async function finishAnalysisProgress(success) {
  cancelAnimationFrame(analysisProgressFrame);
  analysisProgressFrame = 0;
  if (success) {
    const visibleFor = performance.now() - analysisProgressStartedAt;
    if (visibleFor < 650) await new Promise((resolve) => setTimeout(resolve, 650 - visibleFor));
    setAnalysisProgress(100, '분석 결과를 준비했어요.');
    await new Promise((resolve) => setTimeout(resolve, 140));
  }
}

function renderAnalysis(result, input) {
  analysisResult.replaceChildren();
  const header = document.createElement('div'); header.className = 'result-header'; header.append(makeTextElement('div', 'result-badge', result.demo ? 'GREENCHOICE DEMO ANALYSIS' : 'GREENCHOICE AI ANALYSIS'), makeTextElement('h3', '', '나와 지구를 위한 소비 리포트'));
  const summary = document.createElement('div'); summary.className = 'analysis-summary';
  summary.append(makeTextElement('span', 'result-label', '입력한 소비 정보'), makeTextElement('strong', 'summary-item', input.item));
  [[`${Number(input.price).toLocaleString('ko-KR')}원`, 'summary-price'], [`제품 분류 · ${input.carbon_category || result.carbon_category}`, 'summary-category'], [input.purpose || '구매 목적 미입력', ''], [input.frequency || '사용 빈도 미입력', ''], [`비슷한 물건 ${input.hasSimilarItem === '예' ? '있음' : '없음'}`, '']].forEach(([text, className]) => summary.append(makeTextElement('span', className, text)));
  const overview = document.createElement('div'); overview.className = 'result-overview';
  const necessity = document.createElement('div'); necessity.className = `result-hero necessity-${result.necessity_score}`;
  necessity.append(makeTextElement('span', 'result-label', '구매 필요도'), makeTextElement('strong', 'purchase-need-score', `${result.purchase_need_percent}%`), makeTextElement('span', 'purchase-need-category', result.necessity_score));
  const scoreTrack = document.createElement('div'); scoreTrack.className = 'purchase-need-track'; scoreTrack.setAttribute('role', 'progressbar'); scoreTrack.setAttribute('aria-label', '구매 필요도 점수'); scoreTrack.setAttribute('aria-valuemin', '0'); scoreTrack.setAttribute('aria-valuemax', '100'); scoreTrack.setAttribute('aria-valuenow', String(result.purchase_need_percent));
  const scoreFill = document.createElement('span'); scoreFill.style.width = `${result.purchase_need_percent}%`; scoreTrack.append(scoreFill);
  necessity.append(scoreTrack, makeTextElement('small', 'purchase-need-disclaimer', '입력 정보 기반 참고 점수이며 구매 성공 확률은 아니에요.'), makeTextElement('p', 'purchase-need-reason', result.purchase_need_reason), makeTextElement('p', 'necessity-reason', result.necessity_reason));
  const verdict = document.createElement('div'); verdict.className = 'verdict-box'; verdict.append(makeTextElement('span', 'result-label', '최종 제안'), makeTextElement('strong', '', result.final_verdict), makeTextElement('p', 'verdict-reason', result.final_verdict_reason), makeTextElement('p', 'verdict-encouragement', result.encouragement_quote)); overview.append(necessity, verdict);
  const grid = document.createElement('div'); grid.className = 'result-grid';
  const money = document.createElement('article'); money.className = 'result-detail-card money-choices-card'; money.append(makeTextElement('span', 'result-label', '구매 금액으로 할 수 있는 일'), makeTextElement('strong', 'money-choices-total', `${Number(input.price).toLocaleString('ko-KR')}원`));
  const moneyList = document.createElement('ul'); moneyList.className = 'money-choices-list'; result.money_choices.forEach((choice) => moneyList.append(makeTextElement('li', '', choice))); money.append(moneyList);
  const budget = document.createElement('article'); budget.className = 'result-detail-card budget-card';
  const budgetRatio = input.budget ? `${Math.round((Number(input.price) / Number(input.budget)) * 100)}%` : '예산 미입력';
  budget.append(makeTextElement('span', 'result-label', '예산 영향'), makeTextElement('strong', 'budget-ratio', budgetRatio), makeTextElement('p', '', result.budget_impact));
  const environment = document.createElement('article'); environment.className = 'result-detail-card eco-card-result';
  const carbonEstimate = result.carbon_estimate;
  environment.append(makeTextElement('span', 'result-label', '환경 영향'), makeTextElement('strong', 'eco-level', result.eco_impact.level), makeTextElement('p', 'eco-reason', result.eco_impact.reason), makeTextElement('p', 'eco-tip', `실천 팁 · ${result.eco_impact.eco_tip}`));
  if (carbonEstimate) {
    const estimateNote = makeTextElement('p', 'carbon-estimate-note', `제품명 분류: ${carbonEstimate.category}. 제공된 표에서 이 품목 구매 1회를 보류할 때의 초기 탄소량은 ${carbonEstimate.kg}kg CO₂e로 계산했어요. 실제 제품의 전 과정 측정값이나 검증된 감축량은 아니에요.`);
    environment.append(estimateNote);
  }
  grid.append(money, budget, environment);
  const basis = document.createElement('article'); basis.className = 'judgment-basis-card'; basis.append(makeTextElement('span', 'result-label', 'AI 판단 근거 요약'), makeTextElement('p', '', result.judgment_basis));
  const alternatives = document.createElement('article'); alternatives.className = 'alternatives-card'; alternatives.append(makeTextElement('span', 'result-label', '더 나은 선택 아이디어'), makeTextElement('h4', '', '구매 전 시도할 방법')); const list = document.createElement('ul'); result.smart_alternatives.forEach((item) => { const li = document.createElement('li'); li.textContent = item; list.append(li); }); alternatives.append(list);
  const alternativeProducts = document.createElement('article'); alternativeProducts.className = `alternative-products-card ${result.necessity_score === '심사숙고' ? 'secondhand-recommendation' : ''}`;
  const products = result.necessity_score === '심사숙고'
    ? [`중고 ${input.item}도 먼저 비교해 보세요. 제품 상태와 구성품을 확인하고, 보증·반품 가능 여부를 판매자에게 문의한 뒤 새 제품과 총비용을 비교하세요.`, ...result.alternative_products.filter((item) => !/중고/.test(item)).slice(0, 2)]
    : result.alternative_products;
  alternativeProducts.append(makeTextElement('span', 'result-label', result.necessity_score === '심사숙고' ? '심사숙고 결과 추천' : '구매가 어렵다면'), makeTextElement('h4', '', result.necessity_score === '심사숙고' ? '중고 제품을 먼저 비교해보세요' : '비교해볼 대체 제품'));
  const productList = document.createElement('ul'); products.forEach((item) => productList.append(makeTextElement('li', '', item))); alternativeProducts.append(productList);
  analysisResult.append(header, summary, overview, grid, basis, alternatives, alternativeProducts); analysisResult.classList.add('visible'); analysisResult.setAttribute('aria-hidden', 'false');
}

function renderReminderAction(result, input, record) {
  if (result.necessity_score === '심사숙고') return;
  if (!['3일 냉각기간 추천', '구매 비추천'].includes(result.final_verdict)) return;
  const action = document.createElement('div'); action.className = 'reminder-action';
  action.append(makeTextElement('span', 'reminder-kicker', 'COOLING REMINDER'), makeTextElement('strong', '', '🧊 3일 동안 생각 더해보기'), makeTextElement('p', '', '3일 뒤에 다시 확인할 수 있도록 리마인드 알림을 예약해요.'));
  const button = document.createElement('button'); button.type = 'button'; button.className = 'reminder-button'; button.textContent = currentUser ? '3일 뒤 리마인드 예약하기' : '로그인하고 리마인드 예약하기';
  button.addEventListener('click', async () => {
    if (!currentUser) { pendingResult = result; pendingInput = input; openAuth('login'); return; }
    if (!record?.id || String(record.id).startsWith('local-')) { action.querySelector('p').textContent = 'Supabase에 기록이 저장된 뒤 예약할 수 있어요.'; return; }
    button.disabled = true;
    const due = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);
    const response = await supabaseClient.from('reminders').insert({ user_id: currentUser.id, analysis_record_id: record.id, email: currentUser.email, item_name: input.item, price: input.price, remind_at: due.toISOString(), status: 'pending' });
    if (response.error) { action.querySelector('p').textContent = '리마인드 예약에 실패했어요. Supabase reminders 테이블을 확인해 주세요.'; button.disabled = false; return; }
    button.textContent = '✓ 3일 뒤 리마인드 예약 완료'; action.classList.add('scheduled');
  });
  action.append(button); analysisResult.append(action);
}

async function updateRecordStatus(record, status) {
  if (!currentUser || !record?.id) return false;
  if (String(record.id).startsWith('local-')) {
    const key = `greenchoice_history_${currentUser.id}`;
    const history = JSON.parse(localStorage.getItem(key) || '[]').map((item) => String(item.id) === String(record.id) ? { ...item, status } : item);
    localStorage.setItem(key, JSON.stringify(history));
    if (!ledgerModal.hidden) await renderLedger();
    return true;
  }
  const response = await supabaseClient.from('analysis_records').update({ status }).eq('id', record.id).eq('user_id', currentUser.id).select('id,status').maybeSingle();
  if (response.error || !response.data) {
    setHistorySyncNotice(`구매 여부를 계정에 저장하지 못했어요${response.error?.code ? ` (${response.error.code})` : ''}. analysis_records의 UPDATE 정책과 해당 기록의 계정을 확인해 주세요.`);
    return false;
  }
  if (!ledgerModal.hidden) await renderLedger();
  return true;
}

function renderPurchaseDecision(result, input, record) {
  const shouldAsk = result.necessity_score === '필수' || result.necessity_score === '불필요' || result.final_verdict === '구매 비추천';
  if (!shouldAsk) return;
  const card = document.createElement('div'); card.className = 'purchase-decision';
  card.append(makeTextElement('span', 'reminder-kicker', 'ONE LAST CHECK'), makeTextElement('strong', '', result.necessity_score === '필수' ? '정말 필요한 물건이라면, 구매 여부를 기록해볼까요?' : '이번 소비를 어떻게 결정했나요?'), makeTextElement('p', '', '선택한 내용은 내 소비 히스토리에 반영돼요.'));
  const actions = document.createElement('div'); actions.className = 'purchase-decision-actions';
  [['purchased', '구매했어요'], ['skipped', '구매하지 않았어요'], ['secondhand', '중고로 샀어요']].forEach(([status, label]) => { const button = document.createElement('button'); button.type = 'button'; button.textContent = label; button.dataset.purchaseStatus = status; button.addEventListener('click', async () => { if (!currentUser) { pendingResult = result; pendingInput = input; openAuth('login'); return; } button.disabled = true; const saved = await updateRecordStatus(record, status); if (!saved) { button.disabled = false; return; } const savedLabel = { purchased: '구매했어요', skipped: '구매하지 않았어요', secondhand: '중고로 샀어요' }[status]; actions.replaceChildren(makeTextElement('span', 'decision-saved', `✓ ${savedLabel}로 기록했어요.`), makeTextElement('small', 'decision-edit-hint', '사용 기록에서 구매 여부를 수정할 수 있습니다.')); }); actions.append(button); });
  card.append(actions); analysisResult.append(card);
}

async function openHistoryDetail(recordId) {
  if (!currentUser || !supabaseClient) { openAuth('login'); return; }
  const response = await supabaseClient.from('analysis_records').select('id,input_data,result_data,status,created_at').eq('id', recordId).eq('user_id', currentUser.id).single();
  if (response.error || !response.data) { historyDetailMessage.textContent = '이 소비 기록을 찾지 못했어요.'; openModal(historyDetailModal); return; }
  currentReminderRecord = response.data;
  const input = response.data.input_data || {}; historyDetailCopy.textContent = `${input.item || '고민하던 물건'} · ${Number(input.price || 0).toLocaleString('ko-KR')}원\n3일 전의 나와 지금의 생각을 비교해보세요.`;
  historyDetailMessage.textContent = ''; openModal(historyDetailModal);
}

document.querySelectorAll('[data-detail-status]').forEach((button) => button.addEventListener('click', async () => {
  if (!currentReminderRecord || !currentUser) return;
  button.disabled = true;
  const status = button.dataset.detailStatus;
  const response = await supabaseClient.from('analysis_records').update({ status }).eq('id', currentReminderRecord.id).eq('user_id', currentUser.id).select('id,status').maybeSingle();
  if (response.error || !response.data) {
    historyDetailMessage.textContent = '구매 여부를 계정에 저장하지 못했어요. 연결과 기록 수정 권한을 확인해 주세요.';
    button.disabled = false;
    return;
  }
  historyDetailMessage.textContent = status === 'skipped' ? '잘했어요. 구매하지 않기로 한 기록을 저장했어요.' : '지금도 필요한 물건이라면 오래 사용할 방법도 함께 생각해보세요.';
  currentReminderRecord.status = status;
  if (!ledgerModal.hidden) await renderLedger();
  setTimeout(() => closeModal(historyDetailModal), 900);
}));

async function saveAnalysisRecord(result, input) {
  if (!currentUser) return;
  const carbonEstimate = result.carbon_estimate || estimateCarbon(input.item, input.carbon_category || result.carbon_category);
  result.carbon_category = carbonEstimate.category;
  result.carbon_estimate = carbonEstimate;
  const estimatedCarbon = carbonEstimate.kg;
  let saved = false;
  let record = { id: `local-${Date.now()}`, user_id: currentUser.id, input_data: input, result_data: result, status: 'pending', eco_tip_applied: false, estimated_carbon_kg: estimatedCarbon, created_at: new Date().toISOString() };
  if (supabaseClient) {
    const response = await supabaseClient.from('analysis_records').insert({ user_id: currentUser.id, input_data: input, result_data: result, status: 'pending', eco_tip_applied: false, estimated_carbon_kg: estimatedCarbon }).select().single();
    if (!response.error && response.data) { saved = true; record = response.data; }
    else setHistorySyncNotice('이 기록은 이 기기에 임시 저장됐어요. 다른 기기에서도 보려면 Supabase 연결과 analysis_records 테이블 권한을 확인해 주세요.');
  } else setHistorySyncNotice('Supabase 연결이 없어 이 기록은 이 기기에만 임시 저장돼요. 다른 기기에서 보려면 연결을 확인해 주세요.');
  const historyKey = `greenchoice_history_${currentUser.id}`;
  const history = JSON.parse(localStorage.getItem(historyKey) || '[]');
  history.unshift(record);
  localStorage.setItem(historyKey, JSON.stringify(history.slice(0, 30)));
  if (!saved) localStorage.setItem(`greenchoice_last_analysis_${currentUser.id}`, JSON.stringify(history[0]));
  setAnalysisCount(history.length);
  return record;
}

const carbonFactors = {
  문구류: { kg: 0.10, unit: '개' }, '필기구류': { kg: 0.03, unit: '개' }, '종이류': { kg: 0.20, unit: '개' },
  '의류류': { kg: 3, unit: '벌' }, '신발류': { kg: 5, unit: '켤레' }, '패션잡화': { kg: 0.5, unit: '개' },
  '화장품류': { kg: 0.5, unit: '개' }, '소형 전자제품': { kg: 3, unit: '개' }, '대형 전자제품': { kg: 20, unit: '개' },
  '장난감·취미용품': { kg: 1, unit: '개' }, '식품·음료': { kg: 0.3, unit: '개' }, '생활용품': { kg: 0.5, unit: '개' }
};

function classifyCarbonCategory(itemName) {
  const item = String(itemName || '').toLowerCase();
  if (/볼펜|연필|샤프|형광펜|마커|펜슬|\bpen\b|pencil/.test(item)) return '필기구류';
  if (/노트북|랩톱|맥북|데스크톱|데스크탑|컴퓨터|모니터|냉장고|세탁기|건조기|에어컨|텔레비전|\btv\b|전자레인지|대형 가전/.test(item)) return '대형 전자제품';
  if (/휴대폰|핸드폰|스마트폰|아이폰|갤럭시|태블릿|이어폰|헤드폰|마우스|키보드|충전기|카메라|스피커|스마트워치|전자기기/.test(item)) return '소형 전자제품';
  if (/신발|운동화|구두|부츠|샌들|슬리퍼|sneaker|shoes/.test(item)) return '신발류';
  if (/옷|의류|티셔츠|셔츠|바지|청바지|코트|재킷|자켓|원피스|치마|니트|양말|속옷|clothing|jeans|jacket/.test(item)) return '의류류';
  if (/가방|지갑|벨트|모자|목걸이|귀걸이|반지|팔찌|시계|선글라스|패션잡화/.test(item)) return '패션잡화';
  if (/화장품|립스틱|쿠션|파운데이션|선크림|로션|크림|향수|샴푸|스킨케어/.test(item)) return '화장품류';
  if (/장난감|레고|피규어|보드게임|취미|낚싯대|악기|퍼즐|게임기/.test(item)) return '장난감·취미용품';
  if (/음식|식품|과일|채소|간식|커피|음료|식재료|빵|도시락|food|grocery/.test(item)) return '식품·음료';
  if (/종이|복사지|프린트용지|휴지|티슈|키친타월|종이컵/.test(item)) return '종이류';
  if (/문구|노트|공책|다이어리|파일|바인더|스테이플러|가위|풀|자/.test(item)) return '문구류';
  return '생활용품';
}

function estimateCarbon(itemName, category = classifyCarbonCategory(itemName)) {
  const resolvedCategory = Object.hasOwn(carbonFactors, category) ? category : classifyCarbonCategory(itemName);
  return { category: resolvedCategory, ...carbonFactors[resolvedCategory], method: '제공된 품목별 구매 1회 초기 탄소량 표 v1' };
}

function recordCarbonEstimate(record) {
  const input = record.input_data || record.input || {};
  const savedEstimate = record.result_data?.carbon_estimate || record.result?.carbon_estimate;
  return savedEstimate?.method === '제공된 품목별 구매 1회 초기 탄소량 표 v1'
    ? savedEstimate
    : estimateCarbon(input.item, input.carbon_category || record.result_data?.carbon_category || record.result?.carbon_category);
}

function estimateCarbonValue(record) { return Number(recordCarbonEstimate(record).kg) || 0; }

function getProductionEquivalent(totalKg) {
  if (!(totalKg > 0)) return null;
  const [category, factor] = Object.entries(carbonFactors).reduce((closest, entry) => {
    const distance = Math.abs(Math.log(totalKg / entry[1].kg));
    return distance < closest.distance ? { entry, distance } : closest;
  }, { entry: null, distance: Infinity }).entry;
  const quantity = Math.max(0.1, Math.round((totalKg / factor.kg) * 10) / 10);
  return { category, unit: factor.unit, quantity: Number.isInteger(quantity) ? String(quantity) : quantity.toFixed(1) };
}

const badgeDefinitions = [
  { id: 'first', title: '첫 발자국', icon: '✦', description: '첫 소비 분석을 완료했어요.', progress: (history) => `${Math.min(history.length, 1)} / 1`, earned: (history) => history.length > 0 },
  { id: 'shield', title: '철벽 방어', icon: '◇', description: '구매 비추천 물건을 3번 참아냈어요.', progress: (history) => `${Math.min(history.filter((record) => ['구매 비추천', '3일 냉각기간 추천'].includes((record.result_data || record.result || {}).final_verdict) && record.status === 'skipped').length, 3)} / 3`, earned: (history) => history.filter((record) => ['구매 비추천', '3일 냉각기간 추천'].includes((record.result_data || record.result || {}).final_verdict) && record.status === 'skipped').length >= 3 },
  { id: 'earth', title: '지구 수호대', icon: '♧', description: '친환경 팁 적용과 중고 구매를 3회 인증했어요.', progress: (history) => `${Math.min(history.filter((record) => record.status === 'secondhand' && record.eco_tip_applied).length, 3)} / 3`, earned: (history) => history.filter((record) => record.status === 'secondhand' && record.eco_tip_applied).length >= 3 },
  { id: 'wise', title: '현명한 소비왕', icon: '◎', description: '한 달간 예산 대비 지출을 80% 이하로 유지했어요.', progress: (history) => { const now = new Date(); const records = history.filter((record) => { const date = new Date(record.created_at || record.savedAt || 0); return date.getFullYear() === now.getFullYear() && date.getMonth() === now.getMonth(); }); const budget = records.reduce((sum, record) => sum + Number((record.input_data || record.input || {}).budget || 0), 0); const spent = records.filter((record) => record.status === 'purchased' || record.status === 'secondhand').reduce((sum, record) => sum + Number((record.input_data || record.input || {}).price || 0), 0); return budget ? `${Math.round((spent / budget) * 100)}% 사용` : '예산 입력 필요'; }, earned: (history) => { const now = new Date(); const records = history.filter((record) => { const date = new Date(record.created_at || record.savedAt || 0); return date.getFullYear() === now.getFullYear() && date.getMonth() === now.getMonth(); }); const budget = records.reduce((sum, record) => sum + Number((record.input_data || record.input || {}).budget || 0), 0); const spent = records.filter((record) => record.status === 'purchased' || record.status === 'secondhand').reduce((sum, record) => sum + Number((record.input_data || record.input || {}).price || 0), 0); return budget > 0 && spent / budget <= .8; } }
];

function getBadges(history) { return badgeDefinitions.map((badge) => ({ ...badge, isEarned: badge.earned(history) })); }

function renderBadges(history) {
  const badges = getBadges(history); const earnedCount = badges.filter((badge) => badge.isEarned).length; badgeProgress.textContent = `${earnedCount} / ${badges.length} 획득`; badgeGrid.replaceChildren();
  badges.forEach((badge) => { const button = document.createElement('button'); button.type = 'button'; button.className = `badge-card ${badge.isEarned ? 'earned' : 'locked'}`; button.dataset.badgeId = badge.id; button.append(makeTextElement('span', 'badge-icon', badge.icon), makeTextElement('strong', '', badge.title), makeTextElement('small', '', badge.isEarned ? '획득 완료 · 공유하기' : badge.progress(history)), makeTextElement('p', '', badge.description)); badgeGrid.append(button); });
}

function escapeXml(text) { return String(text).replace(/[<>&'"]/g, (character) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', "'": '&apos;', '"': '&quot;' }[character])); }

function openBadgeShare(badge) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="900" height="1100" viewBox="0 0 900 1100"><rect width="900" height="1100" rx="48" fill="#edf5d9"/><circle cx="700" cy="170" r="170" fill="#d8eab4"/><circle cx="150" cy="900" r="210" fill="#dcefe1"/><text x="90" y="130" fill="#6c996e" font-family="Arial,sans-serif" font-size="26" font-weight="700" letter-spacing="5">GREENCHOICE</text><text x="450" y="500" text-anchor="middle" fill="#27664b" font-family="Arial,sans-serif" font-size="190">${escapeXml(badge.icon)}</text><text x="450" y="680" text-anchor="middle" fill="#173d32" font-family="Arial,sans-serif" font-size="58" font-weight="700">${escapeXml(badge.title)}</text><text x="450" y="750" text-anchor="middle" fill="#6e8079" font-family="Arial,sans-serif" font-size="25">${escapeXml(badge.description)}</text><text x="450" y="970" text-anchor="middle" fill="#6da25b" font-family="Arial,sans-serif" font-size="27">나와 지구를 위한 소비 습관</text></svg>`;
  badgeShareImage.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`; badgeShareCopy.textContent = `${badge.title} 뱃지를 획득했어요.`; openModal(badgeShareModal);
}

badgeGrid.addEventListener('click', (event) => { const button = event.target.closest('[data-badge-id]'); if (!button || button.classList.contains('locked')) return; const badge = badgeDefinitions.find((item) => item.id === button.dataset.badgeId); if (badge) openBadgeShare(badge); });
nativeShareButton.addEventListener('click', async () => { const shareText = `Greenchoice에서 '${badgeShareCopy.textContent}'`; if (navigator.share) await navigator.share({ title: 'Greenchoice 소비 뱃지', text: shareText, url: window.location.href }); else { await navigator.clipboard?.writeText(shareText); nativeShareButton.textContent = '✓ 공유 문구가 복사됐어요'; } });

function renderSavingsStats(history) {
  const savedRecords = history.filter((record) => record.status === 'skipped');
  const avoidedNewPurchaseRecords = history.filter((record) => record.status === 'skipped' || record.status === 'secondhand');
  const money = savedRecords.reduce((sum, record) => sum + Number(record.input_data?.price || 0), 0);
  const carbon = avoidedNewPurchaseRecords.reduce((sum, record) => sum + estimateCarbonValue(record), 0);
  savedMoney.textContent = `${money.toLocaleString('ko-KR')}원`;
  savedMoney.parentElement.querySelector('span').textContent = '구매를 보류한 금액 합계';
  savedCarbon.textContent = `${carbon.toFixed(2)}kg CO₂e`;
  savedCarbon.parentElement.querySelector('span').textContent = '감소한 탄소량 (추정)';
  const equivalent = getProductionEquivalent(carbon);
  carbonEquivalent.querySelector('.carbon-equivalent-value').textContent = equivalent
    ? `${equivalent.category} 약 ${equivalent.quantity}${equivalent.unit} 생산 시의 초기 배출량과 비슷해요.`
    : '구매를 보류한 기록이 생기면 비교 결과를 보여드려요.';
}

function renderDashboard(history) {
  const now = new Date(); const monthRecords = history.filter((record) => { const date = new Date(record.created_at || record.savedAt || 0); return date.getFullYear() === now.getFullYear() && date.getMonth() === now.getMonth(); });
  const judged = history.filter((record) => ['purchased', 'skipped', 'secondhand'].includes(record.status));
  const recommendedBought = judged.filter((record) => (record.result_data || record.result || {}).final_verdict === '지금 구매 추천' && record.status === 'purchased').length;
  const followedAvoid = judged.filter((record) => (record.result_data || record.result || {}).final_verdict !== '지금 구매 추천' && (record.status === 'skipped' || record.status === 'secondhand')).length;
  const ignored = judged.filter((record) => (record.result_data || record.result || {}).final_verdict !== '지금 구매 추천' && record.status === 'purchased').length;
  monthlyAnalyses.textContent = `${monthRecords.length}회`; aiRecommendedBought.textContent = `${recommendedBought}회`; aiFollowedAvoid.textContent = `${followedAvoid}회`; aiIgnored.textContent = `${ignored}회`;

  const purposeMap = new Map(); history.forEach((record) => { const input = record.input_data || record.input || {}; const purpose = input.purpose || '기타'; purposeMap.set(purpose, (purposeMap.get(purpose) || 0) + Number(input.price || 0)); });
  const purposeEntries = [...purposeMap.entries()].sort((a, b) => b[1] - a[1]); const total = purposeEntries.reduce((sum, [, amount]) => sum + amount, 0); purposeTotal.textContent = `${Math.round(total).toLocaleString('ko-KR')}원`;
  const colors = ['#78ad83', '#e7bd71', '#a9c777', '#e69a7b', '#a8a6d4', '#b7c4bb'];
  purposeLegend.replaceChildren(); purposeEntries.forEach(([purpose, amount], index) => { const item = document.createElement('span'); item.innerHTML = `<i style="background:${colors[index % colors.length]}"></i>${purpose} ${total ? Math.round((amount / total) * 100) : 0}%`; purposeLegend.append(item); });
  if (purposeChart) purposeChart.destroy();
  if (window.Chart && purposeEntries.length) purposeChart = new window.Chart(document.querySelector('#purposeChart'), { type: 'doughnut', data: { labels: purposeEntries.map(([purpose]) => purpose), datasets: [{ data: purposeEntries.map(([, amount]) => amount), backgroundColor: colors, borderWidth: 3, borderColor: '#fffefa', hoverOffset: 4 }] }, options: { responsive: true, maintainAspectRatio: false, cutout: '70%', plugins: { legend: { display: false }, tooltip: { callbacks: { label: (context) => ` ${Number(context.raw).toLocaleString('ko-KR')}원` } } } } });

  const complianceTotal = recommendedBought + followedAvoid + ignored; const compliance = complianceTotal ? Math.round(((recommendedBought + followedAvoid) / complianceTotal) * 100) : 0; guideRate.textContent = `${compliance}%`; guideCopy.innerHTML = complianceTotal ? `AI 추천과 같은 방향의 선택<br /><strong>${recommendedBought + followedAvoid}회</strong>를 기록했어요.` : '아직 충분한 기록이 없어요.<br />분석 결과를 저장해보세요.'; document.querySelector('.guide-ring').style.setProperty('--rate', `${compliance * 3.6}deg`);
  const estimatedCarbonTotal = history.filter((record) => record.status === 'skipped' || record.status === 'secondhand').reduce((sum, record) => sum + estimateCarbonValue(record), 0);
  carbonTrees.textContent = `절약한 탄소량 · ${Math.round(estimatedCarbonTotal * 10) / 10}kg CO₂e 가정치`;
  carbonDetail.hidden = true;
  let carbonMethodNote = document.querySelector('#carbonMethodNote');
  if (!carbonMethodNote) {
    carbonMethodNote = document.createElement('p');
    carbonMethodNote.id = 'carbonMethodNote';
    carbonMethodNote.className = 'carbon-method-note';
    const source = document.createElement('a');
    source.href = 'https://ghgprotocol.org/product-standard';
    source.target = '_blank';
    source.rel = 'noreferrer';
    source.textContent = 'GHG Protocol 제품 전 과정 산정 범위 안내';
    carbonMethodNote.append(document.createTextNode('품목 분류별 Greenchoice 내부 대표 가정치이며 실제 제품 측정값이나 외부 데이터베이스 수치가 아닙니다. 산정 범위 참고: '), source);
    carbonDetail.closest('.dashboard-carbon').append(carbonMethodNote);
  }
}

async function fetchHistory() {
  if (!currentUser) return [];
  const historyKey = `greenchoice_history_${currentUser.id}`;
  const cached = JSON.parse(localStorage.getItem(historyKey) || '[]');
  if (supabaseClient) {
    let response;
    try {
      response = await supabaseClient.from('analysis_records').select('id,user_id,input_data,result_data,status,eco_tip_applied,estimated_carbon_kg,created_at').eq('user_id', currentUser.id).order('created_at', { ascending: false });
    } catch {
      setHistorySyncNotice('Supabase에 연결할 수 없어 소비 기록을 불러오지 못했어요. 인터넷과 Supabase 프로젝트 URL을 확인해 주세요.');
      return cached;
    }
    if (!response.error && Array.isArray(response.data)) {
      const localOnly = cached.filter((record) => String(record.id).startsWith('local-'));
      let remoteRecords = response.data;
      if (localOnly.length) {
        const migration = await supabaseClient.from('analysis_records').insert(localOnly.map((record) => ({
          user_id: currentUser.id,
          input_data: record.input_data || record.input || {},
          result_data: record.result_data || record.result || {},
          status: record.status || 'pending',
          eco_tip_applied: Boolean(record.eco_tip_applied),
          estimated_carbon_kg: estimateCarbon((record.input_data || record.input || {}).item, (record.input_data || record.input || {}).carbon_category || (record.result_data || record.result || {}).carbon_category).kg,
          created_at: record.created_at || record.savedAt || new Date().toISOString()
        }))).select('id,user_id,input_data,result_data,status,eco_tip_applied,estimated_carbon_kg,created_at');
        if (!migration.error && Array.isArray(migration.data)) {
          remoteRecords = [...remoteRecords, ...migration.data];
          localStorage.setItem(historyKey, JSON.stringify(cached.filter((record) => !String(record.id).startsWith('local-'))));
          setHistorySyncNotice('이 기기에만 저장돼 있던 소비 기록을 계정에 동기화했어요.');
        } else {
          remoteRecords = [...remoteRecords, ...localOnly];
          setHistorySyncNotice('일부 소비 기록은 이 기기에만 남아 있어요. Supabase의 analysis_records 쓰기 권한을 확인해 주세요.');
        }
      } else {
        setHistorySyncNotice('');
      }
      const normalized = await Promise.all(remoteRecords.map(async (record) => {
        const result = record.result_data || {};
        const estimate = estimateCarbon(record.input_data?.item, record.input_data?.carbon_category || result.carbon_category || result.carbon_estimate?.category);
        if (Number(record.estimated_carbon_kg) !== estimate.kg || result.carbon_estimate?.method !== estimate.method || result.carbon_category !== estimate.category) {
          const updatedResult = { ...result, carbon_category: estimate.category, carbon_estimate: estimate };
          await supabaseClient.from('analysis_records').update({ estimated_carbon_kg: estimate.kg, result_data: updatedResult }).eq('id', record.id).eq('user_id', currentUser.id);
          return { ...record, estimated_carbon_kg: estimate.kg, result_data: updatedResult };
        }
        return record;
      }));
      localStorage.setItem(`greenchoice_history_${currentUser.id}`, JSON.stringify(normalized));
      return normalized;
    }
    const code = response.error?.code;
    const detail = code === 'PGRST205' || code === '42P01'
      ? 'analysis_records 테이블을 찾지 못했어요. 테이블 이름과 public 스키마를 확인해 주세요.'
      : code === '42501' || code === 'PGRST301'
        ? '로그인 권한 또는 RLS 읽기 정책이 기록 조회를 막았어요. SELECT 정책에 auth.uid() = user_id 조건이 있는지 확인해 주세요.'
        : `Supabase 오류${code ? ` (${code})` : ''}: ${response.error?.message || '응답을 읽지 못했어요.'}`;
    setHistorySyncNotice(`${detail} 다른 기기와 동기화되지 않을 수 있습니다.`);
    return cached;
  }
  setHistorySyncNotice('Supabase에 연결되지 않아 이 기기의 임시 기록만 보여드리고 있어요.');
  return cached;
}

function localLedgerTransactions() {
  return JSON.parse(localStorage.getItem(`greenchoice_ledger_${currentUser.id}`) || '[]');
}

async function deleteAnalysisRecord(recordId) {
  if (!currentUser || !recordId) return false;
  if (String(recordId).startsWith('local-')) {
    const key = `greenchoice_history_${currentUser.id}`;
    const history = JSON.parse(localStorage.getItem(key) || '[]').filter((record) => String(record.id) !== String(recordId));
    localStorage.setItem(key, JSON.stringify(history));
    return true;
  }
  try {
    const deletion = await supabaseClient.from('analysis_records').delete().eq('id', recordId).eq('user_id', currentUser.id).select('id');
    if (deletion.error) {
      const hint = deletion.error.code === '42501'
        ? 'Supabase에서 analysis_records DELETE 권한 또는 RLS 정책을 확인해 주세요.'
        : deletion.error.code === '23503'
          ? 'reminders의 analysis_record_id 외래 키를 ON DELETE CASCADE로 바꾸는 supabase-delete-policies.sql을 다시 실행해 주세요.'
          : 'Supabase의 analysis_records 설정을 확인해 주세요.';
      setHistorySyncNotice(`소비 기록 삭제 실패 (${deletion.error.code || '오류'}): ${deletion.error.message || '상세 오류 없음'}. ${hint}`);
      return false;
    }
    if (!Array.isArray(deletion.data) || deletion.data.length !== 1) {
      setHistorySyncNotice('Supabase에서 삭제된 행이 0개예요. 이 항목이 현재 계정의 기록인지, 앱이 연결된 프로젝트와 SQL을 실행한 프로젝트가 같은지 확인해 주세요.');
      return false;
    }
    return true;
  } catch {
    setHistorySyncNotice('Supabase 연결 문제로 소비 기록을 삭제하지 못했어요. 다시 시도해 주세요.');
  }
  return false;
}

async function deleteLedgerTransaction(transactionId) {
  if (!currentUser || !transactionId) return false;
  if (String(transactionId).startsWith('local-')) {
    const key = `greenchoice_ledger_${currentUser.id}`;
    const transactions = JSON.parse(localStorage.getItem(key) || '[]').filter((transaction) => String(transaction.id) !== String(transactionId));
    localStorage.setItem(key, JSON.stringify(transactions));
    return true;
  }
  try {
    const deletion = await supabaseClient.from('ledger_transactions').delete().eq('id', transactionId).eq('user_id', currentUser.id).select('id');
    if (deletion.error) {
      ledgerSyncMessage = `가계부 내역 삭제 실패 (${deletion.error.code || '오류'}): ${deletion.error.message || 'Supabase의 ledger_transactions DELETE 권한과 RLS 정책을 확인해 주세요.'}`;
      ledgerUsesLocalStorage = true;
      return false;
    }
    if (!Array.isArray(deletion.data) || deletion.data.length !== 1) {
      ledgerSyncMessage = 'Supabase에서 삭제된 행이 0개예요. 이 항목이 현재 계정의 내역인지, 앱이 연결된 프로젝트와 SQL을 실행한 프로젝트가 같은지 확인해 주세요.';
      ledgerUsesLocalStorage = true;
      return false;
    }
    return true;
  } catch {
    ledgerSyncMessage = 'Supabase 연결 문제로 가계부 내역을 삭제하지 못했어요. 다시 시도해 주세요.';
    ledgerUsesLocalStorage = true;
    return false;
  }
}

function normalizeLedgerTransaction(transaction) {
  const rawType = String(transaction.transaction_type || transaction.type || '').trim().toLowerCase();
  const transactionType = ['expense', 'outgoing', 'outflow', 'debit', '지출'].includes(rawType)
    ? 'expense'
    : ['income', 'incoming', 'inflow', 'credit', '수입'].includes(rawType)
      ? 'income'
      : Number(transaction.amount) < 0 ? 'expense' : rawType;
  return { ...transaction, transaction_type: transactionType, amount: Math.abs(Number(transaction.amount) || 0) };
}

async function fetchLedgerTransactions() {
  const cached = localLedgerTransactions();
  if (supabaseClient) {
    let response;
    try {
      response = await supabaseClient.from('ledger_transactions').select('id,user_id,transaction_type,amount,description,created_at').eq('user_id', currentUser.id).order('created_at', { ascending: false });
    } catch (error) {
      ledgerSyncMessage = `Supabase 가계부 연결에 실패했어요${error?.message ? `: ${error.message}` : '.'}`;
      ledgerUsesLocalStorage = true;
      return cached.map(normalizeLedgerTransaction);
    }
    if (!response.error && Array.isArray(response.data)) {
      const remoteTransactions = response.data.map(normalizeLedgerTransaction);
      const localOnly = cached.filter((transaction) => String(transaction.id).startsWith('local-'));
      if (localOnly.length) {
        const migrated = await supabaseClient.from('ledger_transactions').insert(localOnly.map((transaction) => { const normalized = normalizeLedgerTransaction(transaction); return { user_id: currentUser.id, transaction_type: normalized.transaction_type, amount: normalized.amount, description: normalized.description, created_at: normalized.created_at }; })).select('id,user_id,transaction_type,amount,description,created_at');
        if (!migrated.error && Array.isArray(migrated.data)) {
          localStorage.setItem(`greenchoice_ledger_${currentUser.id}`, JSON.stringify(cached.filter((transaction) => !String(transaction.id).startsWith('local-'))));
          ledgerUsesLocalStorage = false;
          ledgerSyncMessage = '';
          return [...remoteTransactions, ...migrated.data.map(normalizeLedgerTransaction)];
        }
        ledgerSyncMessage = `가계부의 일부 내역은 이 기기에만 남아 있어요. 지출 포함 임시 내역을 동기화하지 못했습니다${migrated.error?.message ? `: ${migrated.error.message}` : '.'}`;
      } else {
        ledgerSyncMessage = '';
      }
      ledgerUsesLocalStorage = localOnly.length > 0;
      return [...remoteTransactions, ...localOnly.map(normalizeLedgerTransaction)];
    }
    ledgerSyncMessage = `Supabase에서 가계부 내역을 불러오지 못했어요${response.error?.code ? ` (${response.error.code})` : ''}${response.error?.message ? `: ${response.error.message}` : ''}. ledger_transactions의 SELECT 정책과 로그인 계정을 확인해 주세요.`;
  }
  ledgerUsesLocalStorage = true;
  if (!ledgerSyncMessage) ledgerSyncMessage = 'Supabase에 연결되지 않아 이 기기의 임시 가계부만 보여드리고 있어요.';
  return cached;
}

async function getCurrentLedgerBalance() {
  const [history, transactions] = await Promise.all([fetchHistory(), fetchLedgerTransactions()]);
  const income = transactions.filter((item) => item.transaction_type === 'income').reduce((sum, item) => sum + Number(item.amount || 0), 0);
  const manualExpense = transactions.filter((item) => item.transaction_type === 'expense').reduce((sum, item) => sum + Number(item.amount || 0), 0);
  const purchaseExpense = history.filter((record) => record.status === 'purchased' || record.status === 'secondhand').reduce((sum, record) => sum + Number((record.input_data || record.input || {}).price || 0), 0);
  return Math.max(0, income - manualExpense - purchaseExpense);
}

async function renderLedger() {
  if (!currentUser) return;
  const [history, transactions] = await Promise.all([fetchHistory(), fetchLedgerTransactions()]);
  const purchases = history
    .filter((record) => ['purchased', 'secondhand', '구매했어요', '중고로 샀어요'].includes(String(record.status || '').trim().toLowerCase()))
    .map((record) => {
      const input = record.input_data || record.input || {};
      return { id: `purchase-${record.id}`, transaction_type: 'expense', amount: Number(input.price) || 0, description: `${input.item || '소비 기록'} 구매`, created_at: record.created_at || record.savedAt, source: 'purchase' };
    });
  const entries = [...transactions, ...purchases].sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));
  const income = transactions.filter((transaction) => normalizeLedgerTransaction(transaction).transaction_type === 'income').reduce((sum, transaction) => sum + Math.abs(Number(transaction.amount) || 0), 0);
  const manualExpense = transactions.filter((transaction) => normalizeLedgerTransaction(transaction).transaction_type === 'expense').reduce((sum, transaction) => sum + Math.abs(Number(transaction.amount) || 0), 0);
  const purchaseExpense = purchases.reduce((sum, transaction) => sum + transaction.amount, 0);
  const expense = manualExpense + purchaseExpense;
  const balance = income - expense;
  const lowBalance = balance <= 0 || (income > 0 && balance <= income * .1);
  const formatMoney = (amount) => `${Math.round(amount).toLocaleString('ko-KR')}원`;

  ledgerBalance.textContent = formatMoney(balance);
  ledgerBalance.classList.toggle('is-low', lowBalance);
  ledgerIncomeTotal.textContent = `+${formatMoney(income)}`;
  ledgerExpenseTotal.textContent = `-${formatMoney(expense)}`;
  ledgerBalanceCaption.textContent = income ? `수입 ${formatMoney(income)}에서 지출 ${formatMoney(expense)}을 뺀 금액이에요.` : '현재 가진 돈을 먼저 들어온 금액으로 등록해 주세요.';
  ledgerWarning.hidden = !lowBalance;
  ledgerWarning.textContent = balance < 0
    ? `지출이 등록된 수입보다 ${formatMoney(Math.abs(balance))} 많아요. 지출 내역을 확인해 주세요.`
    : income > 0
      ? '남은 금액이 총 수입의 10% 이하예요. 남은 지출을 확인해 주세요.'
      : '현재 보유 금액이 0원이에요. 가진 금액을 수입으로 등록해 주세요.';
  ledgerSyncNotice.hidden = !ledgerUsesLocalStorage;
  ledgerSyncNotice.textContent = ledgerSyncMessage;
  ledgerEntryCount.textContent = `${entries.length}건`;
  ledgerEntries.replaceChildren();
  if (!entries.length) {
    ledgerEntries.append(makeTextElement('p', 'ledger-empty', '아직 기록이 없어요. 첫 수입이나 지출을 입력해 보세요.'));
    return;
  }

  entries.forEach((entry) => {
    const isIncome = entry.transaction_type === 'income';
    const row = document.createElement('article'); row.className = `ledger-entry ${isIncome ? 'ledger-entry-income' : 'ledger-entry-expense'}`;
    const copy = document.createElement('div'); copy.className = 'ledger-entry-copy';
    copy.append(makeTextElement('strong', '', entry.description || (entry.source === 'purchase' ? '소비 기록 구매' : '내역')));
    const date = entry.created_at ? new Date(entry.created_at) : new Date();
    copy.append(makeTextElement('span', '', `${date.toLocaleDateString('ko-KR', { month: 'long', day: 'numeric' })}${entry.source === 'purchase' ? ' · 소비 기록' : ''}`));
    row.append(copy, makeTextElement('strong', 'ledger-entry-amount', `${isIncome ? '+' : '-'}${formatMoney(Number(entry.amount) || 0)}`));
    const deleteButton = document.createElement('button');
    deleteButton.type = 'button';
    deleteButton.className = 'record-delete-button';
    deleteButton.textContent = '삭제';
    deleteButton.setAttribute('aria-label', `${entry.description || '가계부 내역'} 삭제`);
    deleteButton.dataset.ledgerDeleteId = entry.source === 'purchase' ? entry.id.replace(/^purchase-/, '') : entry.id;
    deleteButton.dataset.ledgerDeleteSource = entry.source || 'transaction';
    row.append(deleteButton);
    ledgerEntries.append(row);
  });
}

ledgerEntries.addEventListener('click', async (event) => {
  const button = event.target.closest('[data-ledger-delete-id]');
  if (!button || !currentUser) return;
  const isPurchase = button.dataset.ledgerDeleteSource === 'purchase';
  if (button.dataset.confirmDelete !== 'true') {
    button.dataset.confirmDelete = 'true';
    button.textContent = isPurchase ? '기록까지 삭제 확인' : '삭제 확인';
    ledgerMessage.textContent = isPurchase
      ? '한 번 더 누르면 구매 지출과 연결된 사용 기록을 삭제합니다.'
      : '한 번 더 누르면 이 가계부 내역을 삭제합니다.';
    return;
  }
  button.disabled = true;
  button.textContent = '삭제 중...';
  const deleted = isPurchase
    ? await deleteAnalysisRecord(button.dataset.ledgerDeleteId)
    : await deleteLedgerTransaction(button.dataset.ledgerDeleteId);
  if (!deleted) {
    const deleteError = isPurchase ? historySyncNotice.textContent : ledgerSyncMessage;
    await renderLedger();
    ledgerSyncMessage = deleteError;
    ledgerUsesLocalStorage = true;
    ledgerSyncNotice.textContent = deleteError;
    ledgerSyncNotice.hidden = false;
    ledgerMessage.textContent = deleteError || '삭제하지 못했어요. 화면의 안내를 확인해 주세요.';
    return;
  }
  ledgerMessage.textContent = isPurchase ? '구매 지출과 연결된 소비 기록을 삭제했어요.' : '가계부 내역을 삭제했어요.';
  if (isPurchase) await renderHistory();
  await renderLedger();
});

budgetInput.addEventListener('input', () => {
  if (budgetInput.value !== '' && Number(budgetInput.value) < 0) {
    budgetInput.value = '0';
    budgetImportMessage.textContent = '음수 금액은 입력할 수 없어 0원으로 바꿨어요.';
  } else {
    budgetImportMessage.textContent = '가계부 잔액을 입력할 수 있어요. 음수 금액은 입력할 수 없습니다.';
  }
});

budgetImportButton.addEventListener('click', async () => {
  if (!currentUser) {
    budgetImportMessage.textContent = '가계부 잔액을 불러오려면 먼저 로그인해 주세요.';
    openAuth('login');
    return;
  }
  budgetImportButton.disabled = true;
  budgetImportMessage.textContent = '가계부 잔액을 불러오고 있어요...';
  try {
    const balance = await getCurrentLedgerBalance();
    budgetInput.value = String(balance);
    budgetImportMessage.textContent = `가계부 잔액 ${balance.toLocaleString('ko-KR')}원을 입력했어요. 음수 잔액은 0원으로 적용됩니다.`;
  } catch {
    budgetImportMessage.textContent = '가계부 잔액을 불러오지 못했어요. 로그인과 Supabase 연결을 확인해 주세요.';
  } finally {
    budgetImportButton.disabled = false;
  }
});

ledgerForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  if (!currentUser) return;
  const transactionType = document.querySelector('#ledgerType').value;
  const amount = Number(document.querySelector('#ledgerAmount').value);
  const description = document.querySelector('#ledgerDescription').value.trim();
  if (!Number.isFinite(amount) || amount <= 0 || !description) return;
  const transaction = { id: `local-${Date.now()}`, user_id: currentUser.id, transaction_type: transactionType, amount, description, created_at: new Date().toISOString() };
  const submit = ledgerForm.querySelector('button[type="submit"]');
  submit.disabled = true;
  ledgerMessage.textContent = '내역을 저장하고 있어요...';

  if (supabaseClient) {
    try {
      const response = await supabaseClient.from('ledger_transactions').insert({ user_id: currentUser.id, transaction_type: transactionType, amount, description }).select('id,user_id,transaction_type,amount,description,created_at').single();
      if (!response.error && response.data) {
        ledgerSyncMessage = '';
        ledgerUsesLocalStorage = false;
        ledgerMessage.textContent = '내역을 저장했어요.';
        submit.disabled = false;
        ledgerForm.reset();
        await renderLedger();
        return;
      }
      ledgerSyncMessage = `Supabase가 ${transactionType === 'expense' ? '지출' : '수입'} 내역을 저장하지 못했어요${response.error?.code ? ` (${response.error.code})` : ''}${response.error?.message ? `: ${response.error.message}` : ''}. ledger_transactions의 INSERT 정책을 확인해 주세요.`;
    } catch (error) {
      ledgerSyncMessage = `Supabase 연결 중 오류가 나 ${transactionType === 'expense' ? '지출' : '수입'} 내역을 동기화하지 못했어요${error?.message ? `: ${error.message}` : '.'}`;
    }
  } else {
    ledgerSyncMessage = 'Supabase 연결이 없어 이 내역은 다른 기기와 동기화되지 않아요.';
  }

  const cached = localLedgerTransactions();
  cached.unshift(transaction);
  localStorage.setItem(`greenchoice_ledger_${currentUser.id}`, JSON.stringify(cached));
  ledgerUsesLocalStorage = true;
  ledgerSyncMessage = `${ledgerSyncMessage} 이 ${transactionType === 'expense' ? '지출' : '수입'} 내역은 이 기기에 임시 저장됐어요.`;
  ledgerMessage.textContent = `${transactionType === 'expense' ? '지출' : '수입'} 내역을 Supabase에 저장하지 못해 이 기기에 임시 저장했어요.`;
  submit.disabled = false;
  ledgerForm.reset();
  await renderLedger();
});

async function renderHistory() {
  historyList.replaceChildren();
  if (!currentUser) return;
  historyList.append(makeTextElement('p', 'empty-history', '기록을 불러오는 중이에요...'));
  const history = await fetchHistory();
  setAnalysisCount(history.length);
  renderSavingsStats(history);
  renderDashboard(history);
  renderBadges(history);
  historyList.replaceChildren();
  if (!history.length) {
    const emptyMessage = supabaseClient
      ? '계정에 저장된 소비 기록이 없어요. 기록을 처음 만든 다른 기기에서 로그인한 뒤 사용 기록을 열면 기기 임시 기록을 계정으로 옮길 수 있어요.'
      : 'Supabase 연결을 확인할 수 없어 계정 기록을 불러오지 못했어요.';
    historyList.append(makeTextElement('p', 'empty-history', emptyMessage));
    return;
  }
  history.forEach((record) => {
    const input = record.input_data || record.input || {}; const result = record.result_data || record.result || {}; const status = record.status || 'pending';
    const item = document.createElement('article'); item.className = 'history-item';
    const date = new Date(record.created_at || record.savedAt || Date.now()).toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' });
    const statusLabel = { pending: '아직 결정 전', skipped: '참았어요!', purchased: '구매했어요', secondhand: '중고로 샀어요' }[status] || status;
    item.append(makeTextElement('div', 'history-date', date), makeTextElement('h3', '', input.item), makeTextElement('span', 'history-verdict', result.final_verdict || '분석 완료'), makeTextElement('p', 'history-category', `제품 분류 · ${input.carbon_category || result.carbon_category || '분류 정보 없음'}`), makeTextElement('p', '', `${Number(input.price).toLocaleString('ko-KR')}원`), makeTextElement('span', 'history-status', statusLabel));
    const actions = document.createElement('div'); actions.className = 'history-actions';
    [['skipped', '참았어요! (지출 안 함)'], ['purchased', '구매했어요'], ['secondhand', '중고로 샀어요']].forEach(([nextStatus, label]) => { const button = document.createElement('button'); button.type = 'button'; button.dataset.recordId = record.id; button.dataset.status = nextStatus; button.textContent = label; button.className = nextStatus === status ? 'active' : ''; actions.append(button); });
    if (status === 'secondhand') { const ecoButton = document.createElement('button'); ecoButton.type = 'button'; ecoButton.dataset.recordId = record.id; ecoButton.dataset.eco = 'true'; ecoButton.textContent = record.eco_tip_applied ? '✓ 친환경 팁 인증 완료' : '친환경 팁 적용했어요'; ecoButton.className = record.eco_tip_applied ? 'active eco-cert' : 'eco-cert'; actions.append(ecoButton); }
    const deleteButton = document.createElement('button');
    deleteButton.type = 'button';
    deleteButton.className = 'record-delete-button history-delete-button';
    deleteButton.textContent = '기록 삭제';
    deleteButton.dataset.historyDeleteId = record.id;
    item.append(actions, deleteButton);
    historyList.append(item);
  });
}

historyList.addEventListener('click', async (event) => {
  const deleteButton = event.target.closest('[data-history-delete-id]');
  if (deleteButton && currentUser) {
    if (deleteButton.dataset.confirmDelete !== 'true') {
      deleteButton.dataset.confirmDelete = 'true';
      deleteButton.textContent = '한 번 더 눌러 삭제';
      return;
    }
    deleteButton.disabled = true;
    deleteButton.textContent = '삭제 중...';
    const deleted = await deleteAnalysisRecord(deleteButton.dataset.historyDeleteId);
    if (!deleted) {
      const deleteError = historySyncNotice.textContent;
      await renderHistory();
      setHistorySyncNotice(deleteError);
      return;
    }
    setHistorySyncNotice('소비 기록을 삭제했어요.');
    await renderHistory();
    if (!ledgerModal.hidden) await renderLedger();
    return;
  }
  const button = event.target.closest('button[data-record-id]');
  if (!button || !currentUser) return;
  button.disabled = true;
  const id = button.dataset.recordId; const status = button.dataset.status;
  if (button.dataset.eco === 'true') {
    const ecoValue = !JSON.parse(localStorage.getItem(`greenchoice_history_${currentUser.id}`) || '[]').find((record) => String(record.id) === String(id))?.eco_tip_applied;
    if (String(id).startsWith('local-')) { const key = `greenchoice_history_${currentUser.id}`; const history = JSON.parse(localStorage.getItem(key) || '[]').map((record) => String(record.id) === String(id) ? { ...record, eco_tip_applied: ecoValue } : record); localStorage.setItem(key, JSON.stringify(history)); }
    else if (supabaseClient) await supabaseClient.from('analysis_records').update({ eco_tip_applied: ecoValue }).eq('id', id).eq('user_id', currentUser.id);
    await renderHistory(); return;
  }
  if (String(id).startsWith('local-')) {
    const key = `greenchoice_history_${currentUser.id}`; const history = JSON.parse(localStorage.getItem(key) || '[]').map((record) => String(record.id) === String(id) ? { ...record, status } : record); localStorage.setItem(key, JSON.stringify(history));
  } else if (supabaseClient) {
    const response = await supabaseClient.from('analysis_records').update({ status }).eq('id', id).eq('user_id', currentUser.id).select('id,status').maybeSingle();
    if (response.error || !response.data) {
      setHistorySyncNotice(`구매 여부를 다른 기기와 동기화하지 못했어요${response.error?.code ? ` (${response.error.code})` : ''}. analysis_records의 UPDATE 정책과 해당 기록의 계정을 확인해 주세요.`);
      button.disabled = false;
      return;
    }
  }
  await renderHistory();
  if (!ledgerModal.hidden) await renderLedger();
});

function openSavePrompt(result, input) { pendingResult = result; pendingInput = input; openModal(savePrompt); }
document.querySelectorAll('#saveLoginButton, #challengeLoginButton').forEach((button) => button.addEventListener('click', () => { closeModal(savePrompt); openAuth('login'); }));

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  if (!getValue('item') || !getValue('price')) return;
  const purpose = getValue('reason') === '기타' ? getValue('otherPurpose') : getValue('reason');
  const useMockAnalysis = document.querySelector('#mockAnalysis').checked;
    const frequencyCount = Number(getValue('frequencyCount'));
    const frequencyUnit = getValue('frequencyUnit');
    if (!Number.isInteger(frequencyCount) || frequencyCount < 1 || frequencyCount > 99) {
      const frequencyInput = document.querySelector('#frequencyCount');
      frequencyInput.setCustomValidity('1회 이상 99회 이하의 횟수를 입력해 주세요.');
      frequencyInput.reportValidity();
      return;
    }
    const frequencyInput = document.querySelector('#frequencyCount');
    frequencyInput.setCustomValidity('');
    const frequencyPeriod = { day: '하루', week: '주', month: '한 달' }[frequencyUnit] || '주';
    const input = { item: getValue('item'), carbon_category: getValue('carbonCategory'), price: Number(getValue('price')), budget: Number(getValue('budget')) || 0, purpose, frequency: `${frequencyPeriod} ${frequencyCount}회`, frequency_count: frequencyCount, frequency_unit: frequencyUnit, hasSimilarItem: getValue('duplicate'), considersSecondhand: getValue('recycle'), additionalInfo: getValue('additionalInfo').trim() };
   analysisResult.classList.remove('visible'); analysisResult.setAttribute('aria-hidden', 'true'); loadingCard.classList.add('visible'); loadingCard.setAttribute('aria-hidden', 'false'); loadingCard.scrollIntoView({ behavior: 'smooth', block: 'center' }); startAnalysisProgress();
    let progressFinished = false;
    try {
      const endpoint = useMockAnalysis ? '/api/analyze/mock' : '/api/analyze';
      const response = await fetch(endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(input) });
      const payload = await response.json();
      if (!response.ok || !payload.result) throw new Error(payload.error || '분석 결과를 받지 못했습니다.');
      payload.result.carbon_estimate = estimateCarbon(input.item, input.carbon_category);
      payload.result.carbon_category = payload.result.carbon_estimate.category;
      let record = null;
      if (!useMockAnalysis && currentUser) record = await saveAnalysisRecord(payload.result, input);
      await finishAnalysisProgress(true);
      progressFinished = true;
      loadingCard.classList.remove('visible');
      loadingCard.setAttribute('aria-hidden', 'true');
      renderAnalysis(payload.result, input);
      if (!useMockAnalysis) {
        renderReminderAction(payload.result, input, record);
        renderPurchaseDecision(payload.result, input, record);
        if (!currentUser) setTimeout(() => openSavePrompt(payload.result, input), 350);
      }
    } catch (error) {
      showError(error.message || '잠시 후 다시 시도해 주세요.');
    } finally {
      if (!progressFinished) await finishAnalysisProgress(false);
      loadingCard.classList.remove('visible');
      loadingCard.setAttribute('aria-hidden', 'true');
      analysisResult.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
});

resetButton.addEventListener('click', () => { cancelAnimationFrame(analysisProgressFrame); analysisProgressFrame = 0; loadingCard.classList.remove('visible'); loadingCard.setAttribute('aria-hidden', 'true'); analysisResult.classList.remove('visible'); analysisResult.replaceChildren(); form.reset(); document.querySelector('#otherPurpose').classList.remove('visible'); document.querySelector('#analyze').scrollIntoView({ behavior: 'smooth' }); });

supabaseReadyPromise = initSupabase();
