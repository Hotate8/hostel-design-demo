/* Synthetic workflow review only. Never use this code as application security. */
(() => {
  'use strict';
  const KEY = 'hostel-workflow-review-v1';
  const config = Object.freeze({listingCost: 50, registrationBonus: 200, purchasePriceJPY: 10}); // All provisional.
  const page = document.body.dataset.page;
  const $ = selector => document.querySelector(selector);
  const $$ = selector => [...document.querySelectorAll(selector)];
  const baseJob = {title:'短編映画の撮影助手を募集',occupation:'撮影助手',compensation:'20000',unit:' / 日',location:'東京都渋谷区',start:'2026-11-28',end:'2026-11-29',headcount:'1',description:'少人数のチームで、短編映画の撮影を支えていただきます。',notes:'',owner:'hiring',status:'公開中',charged:false};
  const profiles = {
    hiring:{displayName:'小林 美香',email:'mika@example.test',location:'東京都渋谷区',occupation:'Job title A',occupations:['Job title A'],company:'架空の制作チーム'},
    applicant:{displayName:'青木 あき',email:'aki@example.test',location:'東京都世田谷区',occupation:'Job title B',occupations:['Job title B']}
  };
  function initial() { return {active:null,accounts:{},job:{...baseJob},application:null,messages:[],invoice:null,flash:'',target:null}; }
  let state = initial(), storageOK = true;
  try { state = JSON.parse(localStorage.getItem(KEY)) || initial(); } catch { storageOK = false; }
  function save() { try { localStorage.setItem(KEY,JSON.stringify(state)); } catch { storageOK=false; $('#storage-error').hidden=false; } }
  function go(destination, flash='') { state.flash=flash; save(); location.href=destination+'.html'; }
  const account = () => state.accounts[state.active];
  function provision(id) {
    if (!state.accounts[id]) state.accounts[id]={profile:{...profiles[id]},verified:true,complete:true,balance:config.registrationBonus,events:[{kind:'grant',amount:config.registrationBonus,label:'初回登録Bonus（暫定例・適用条件は提案）',date:new Date().toISOString()}]};
  }
  function fail(message, form=null) {
    const box=form?.querySelector('.error') || $('#publish-error') || $('#flash');
    box.textContent=message; box.hidden=false; box.scrollIntoView({block:'center'});
  }
  function need(target) {
    const a=account();
    if (!a || !a.verified || !a.complete) {state.target=target; go('access'); return false;}
    return true;
  }
  function ownership(target) {
    if (!need(target)) return false;
    if (state.active!==state.job.owner) {go('access','この募集は別のアカウントの所有です。画面一覧から募集者シナリオに切り替えてください。');return false;}
    return true;
  }
  function node(tag,text,cls='') {const el=document.createElement(tag);el.textContent=text;if(cls)el.className=cls;return el;}
  function anchor(text,href) {const el=node('a',text,'link');el.href=href;return el;}
  function hydrate(fields, values) {fields.forEach(el=>{if(values[el.dataset.job ?? el.dataset.profile ?? el.dataset.public]!==undefined) el.textContent=values[el.dataset.job ?? el.dataset.profile ?? el.dataset.public];});}
  function finishAccount() {const target=state.target;state.target=null;go(target || 'home','プロフィールを保存しました。');}
  function scenario(name) {
    if(!['applicant','owner'].includes(name)) state=initial();
    if(name==='new') {save();go('register');return;}
    provision('hiring');provision('applicant');
    state.active=name==='owner'?state.job.owner:name==='applicant'||name==='review'?'applicant':'hiring';
    if(name==='review') state.application={applicant:'applicant',status:'Accepted',introduction:'撮影助手として現場経験があります。両日参加できます。'};
    if(name==='insufficient') {state.accounts.hiring.balance=0;state.accounts.hiring.events=[];state.draft={...state.job};}
    save();go(name==='profile'?'my-profile':name==='owner'?'job-manage':name==='insufficient'?'job-review':name==='review'?'application-detail':name==='applicant'?'job-detail':'my-jobs');
  }
  $$('[data-scenario]').forEach(el=>el.addEventListener('click',()=>scenario(el.dataset.scenario)));
  if(!storageOK) $('#storage-error').hidden=false;
  $('#account-label').textContent=account()?(account().profile.displayName||'アカウント'):'ゲスト';
  if(state.flash) {$('#flash').textContent=state.flash;$('#flash').hidden=false;state.flash='';save();}
  if(state.verificationNotice){
    const toast=$('#verification-toast');toast.hidden=false;
    state.verificationNotice=false;save();
    window.setTimeout(()=>{toast.hidden=true;},5000);
  }
  $('#verification-toast-close').addEventListener('click',()=>{$('#verification-toast').hidden=true;});
  if(['my-profile','profile-edit','profile-setup'].includes(page)&&!account()){state.target=page;go('login');return;}
  const protectedPages={'job-new':'job-new','job-review':'job-review','application-new':'application-new'};
  if(protectedPages[page] && !need(page)) return;
  if(['job-manage','job-edit','job-close','job-complete','applicants','applicant-detail','applicant-status'].includes(page) && !ownership(page)) return;
  const visibleJob = ['job-review','job-new'].includes(page) && state.draft ? state.draft : state.job;
  hydrate($$('[data-job]'),{...visibleJob,compensation:Number(visibleJob.compensation).toLocaleString('ja-JP')});
  // Preserve already-entered legacy demo locations while the form now splits prefecture/city.
  if(account()&&!account().profile.prefecture){
    const legacy=(account().profile.location||'').match(/^(東京都|北海道|(?:京都|大阪)府|.{2,3}県)(.*)$/);
    if(legacy){account().profile.prefecture=legacy[1];account().profile.city=legacy[2];}
  }
  hydrate($$('[data-profile]'),account()?.profile || profiles.applicant);
  $$('[data-cost]').forEach(el=>el.textContent=config.listingCost);
  $$('[data-bonus]').forEach(el=>el.textContent=config.registrationBonus);
  $$('[data-price]').forEach(el=>el.textContent=config.purchasePriceJPY);
  $$('[data-balance]').forEach(el=>el.textContent=account()?.balance ?? '—');
  if($('#after-balance')) $('#after-balance').textContent=Math.max(0,(account()?.balance ?? 0)-config.listingCost);
  if(page==='access') {$('#access-reason').textContent=!account()?'ログインすると、応募や募集公開を続けられます。':!account().verified?'続けるには、メール認証を完了してください。':'続けるには、表示名・活動拠点・職種を入力してください。';}
  if(page==='verify') $('#verification-email').textContent=account()?.profile.email||'登録またはログインからお進みください。';
  if(page==='verify' && account() && !account().challenge) {account().challenge={issued:Date.now(),attempts:0,sends:[Date.now()]};save();}
  if(page==='public-profile') {
    const person=new URLSearchParams(location.search).get('person');
    const personId=person==='poster'?state.job.owner:person==='applicant'?(state.application?.applicant||'applicant'):(state.active||'applicant');
    const data=state.accounts[personId]?.profile||(person==='poster'?profiles.hiring:profiles.applicant);
    hydrate($$('[data-public]'),data);
    const labels={introduction:'自己紹介',skills:'スキル',experience:'経験',credits:'作品実績',portfolio:'ポートフォリオ',workAreas:'稼働地域',company:'会社・制作名',website:'会社Website',companyIntroduction:'会社紹介',companyCredits:'会社の制作実績'};
    Object.entries(labels).forEach(([key,label])=>{if(typeof data[key]==='string'&&data[key].trim()) {$('#public-sections').append(node('h2',label),node('p',data[key]));}});
    const hasJob=personId===state.job.owner&&!state.job.removed;
    $('#public-profile-jobs').hidden=!hasJob;
    if(hasJob)$('#public-profile-job-link').textContent=state.job.title+' →';
    $('#public-profile-owner-return').hidden=personId!==state.active;
  }
  if(page==='points-history') {
    const box=$('#point-events');
    if(!account()?.events.length) box.append(node('p','まだ付与・利用履歴がありません。'));
    else [...account().events].reverse().forEach(event=>{const card=node('section','','card');card.append(node('small',new Date(event.date).toLocaleString('ja-JP')),node('h2',event.label),node('p',`${event.kind==='grant'?'+':'−'}${event.amount} points（暫定例）`));if(event.kind==='spend')card.append(anchor('関連する募集を見る →','job-detail.html'));box.append(card);});
  }
  if(page==='my-profile'){
    const profile=account()?.profile;
    if(profile){
      const labels={introduction:'自己紹介',skills:'スキル',experience:'経験',credits:'作品実績',portfolio:'ポートフォリオURL',workAreas:'稼働地域',company:'会社・制作名',website:'会社Website',companyIntroduction:'会社紹介',companyCredits:'会社の制作実績',email:'ログインメール（本人のみ）',legalName:'本名（本人のみ）'};
      Object.entries(labels).forEach(([key,label])=>{if(typeof profile[key]==='string'&&profile[key].trim())$('#own-profile-sections').append(node('h2',label),node('p',profile[key]));});
    }
  }
  const application=state.application;
  $$('[data-application-status]').forEach(el=>el.textContent=application?.status || '応募はありません');
  $$('[data-application-introduction]').forEach(el=>el.textContent=application?.introduction || '画面一覧から「応募後」のシナリオを開始するか、募集へ応募してください。');
  if($('#applicant-name')) $('#applicant-name').textContent=state.accounts[application?.applicant]?.profile.displayName || '青木 あき';
  if($('#poster-name')) $('#poster-name').textContent=state.accounts[state.job.owner]?.profile.displayName || profiles.hiring.displayName;
  if($('#application-actions')&&!application) $('#application-actions').hidden=true;
  if(page==='my-applications'||page==='applicants') {
    const box=$(page==='applicants'?'#applicant-list':'#application-list');
    if(!application || (page==='my-applications'&&application.applicant!==state.active)) box.append(node('p','まだ応募がありません。'));
    else {const card=node('section','','card');card.append(node('h2',page==='applicants'?(state.accounts[application.applicant]?.profile.displayName || '応募者'):state.job.title),node('p',application.status),anchor('内容を確認する →',page==='applicants'?'applicant-detail.html':'application-detail.html'));box.append(card);}
  }
  $$('[data-job-status]').forEach(el=>el.textContent=state.job.status);
  if($('#job-status')) $('#job-status').textContent=state.job.status;
  if($('#detail-status')) $('#detail-status').textContent=`募集状況：${state.job.removed?'掲載削除（デモ）':state.job.status}`;
  if($('#user-moderation-status')&&state.suspended) $('#user-moderation-status').textContent='利用停止を記録しました（表示のみのデモ）';
  if($('#job-moderation-status')&&state.job.removed) $('#job-moderation-status').textContent='掲載削除を記録しました（表示のみのデモ）';
  function renderMessages() {const box=$('#message-list');if(!box)return;box.replaceChildren();const messages=state.messages.length?state.messages:[{name:'小林 美香',text:'ご応募ありがとうございます。撮影日程について確認させてください。'}];messages.forEach(message=>{const item=node('article','','message');item.append(node('small',message.name),node('p',message.text));box.append(item);});}
  renderMessages();
  if($('#invoice-content')) {
    const invoice=state.invoice;
    if(!invoice) $('#invoice-content').append(node('p','請求書情報がありません。作成画面から入力してください。'),anchor('請求書を作成 →','invoice-new.html'));
    else {const box=$('#invoice-content');box.append(node('p','画面確認用・架空のデモ請求書／実取引には利用不可','watermark'),node('h2','請求書'),node('p',`${invoice.recipient} 御中`),node('p',`発行者：${invoice.issuer}`),node('p',`件名：${invoice.subject}`),node('h2',`ご請求金額：JPY ${Number(invoice.amount).toLocaleString('ja-JP')}`),node('p',`支払期日：${invoice.due}`),node('p',invoice.instructions),node('small','税・経費・必要項目は確認中。この金額は手入力のサンプルで、求人報酬からの自動計算ではありません。'));}
  }
  if($('#state-selector')) $('#state-selector').addEventListener('change',event=>{$('#state-example').textContent={loading:'読み込み中です…',empty:'まだ項目がありません。',error:'読み込めませんでした。もう一度お試しください。',denied:'この操作を行う権限がありません。',success:'保存しました。'}[event.target.value];});
  const normalizeEmail = value => value.trim().toLowerCase();
  // Predictable identifiers are only for local flow review, never recovery credentials.
  function resetLinkProblem() {
    const id=new URLSearchParams(location.search).get('token');
    const entry=state.resetLinks?.find(link=>link.id===id);
    if(!entry)return 'invalid';
    if(entry.used)return 'used';
    if(entry.replaced)return 'replaced';
    if(Date.now()-entry.issued>=30*60*1000)return 'expired';
    return null;
  }
  if(page==='password-new') {
    const reason=resetLinkProblem();if(reason){location.href='password-link-error.html?reason='+reason;return;}
  }
  if(page==='password-email') {
    const latest=state.resetLinks?.find(link=>link.id===state.lastResetRequest?.linkId);
    $('#reset-demo-email').hidden=!latest;$('#reset-no-demo-email').hidden=!!latest;
    if(latest)$('#reset-email-link').href='password-new.html?token='+encodeURIComponent(latest.id);
  }
  if(page==='password-link-error') {
    const reason=new URLSearchParams(location.search).get('reason');
    $('#reset-link-error-message').textContent={expired:'リンクの有効期限が切れました。再設定メールを送信してください。',replaced:'このリンクは無効です。最新のメールをご確認ください。',used:'このリンクは使用済みです。ログインするか、再設定メールを送信してください。',invalid:'このリンクは無効です。再設定メールを送信してください。'}[reason]||'このリンクは無効です。再設定メールを送信してください。';
  }
  function passwordRuleError(password) {
    let passwordError = '';
      if(!password) passwordError='Enter a password.';
      else if(password.length<15) passwordError='Use at least 15 characters.';
      else if(password.length>64) passwordError='Use 64 characters or fewer.';
      else if(/\s/.test(password)) passwordError='Spaces are not allowed.';
      else if(/[^\x21-\x7e]/.test(password)) passwordError='Use English letters, numbers, and approved symbols only.';
      else if(!/[A-Z]/.test(password)) passwordError='Include at least one uppercase letter.';
      else if(!/[\x21-\x2f\x3a-\x40\x5b-\x60\x7b-\x7e]/.test(password)) passwordError='Include at least one special character.';
    return passwordError;
  }
  function setupRegistration(form) {
    const fields = Object.fromEntries(['email','password','confirmation'].map(name=>[name,form.elements.namedItem(name)]));
    const touched = new Set();
    const submit = $('#register-submit');
    let pending = false, duplicateEmail = null;
    function errors() {
      const password = fields.password.value;
      const passwordError=passwordRuleError(password);
      const email=normalizeEmail(fields.email.value);
      const emailError=!email?'Enter your email address.':!fields.email.checkValidity()?'Enter a valid email address.':duplicateEmail===email?'This email is already registered.':'';
      return {email:emailError,password:passwordError,confirmation:!fields.confirmation.value?'Confirm your password.':fields.confirmation.value!==password?'Passwords do not match.':''};
    }
    function render() {
      const messages=errors();
      Object.entries(messages).forEach(([name,message])=>{
        const show=touched.has(name)&&!!message;
        const box=$('#'+name+'-error');box.textContent=show?message:'';box.hidden=!show;
        fields[name].setAttribute('aria-invalid',String(show));
      });
      submit.disabled=pending||Object.values(messages).some(Boolean);
      submit.textContent=pending?'Creating your account…':'会員登録';
      Object.values(fields).forEach(input=>{input.readOnly=pending;});
      form.setAttribute('aria-busy',String(pending));
    }
    function clearSecrets() {
      if(pending)return;
      fields.password.value='';fields.confirmation.value='';
      for(const name of ['password','confirmation']) {fields[name].type='password';touched.delete(name);}
      $$('[data-password-toggle]').forEach(button=>{button.textContent='Show';button.setAttribute('aria-pressed','false');});
      render();
    }
    fields.email.value=state.registrationEmail||'';
    clearSecrets();
    window.addEventListener('pageshow',clearSecrets); // Includes browser Back / bfcache restoration.
    Object.entries(fields).forEach(([name,input])=>{
      input.addEventListener('blur',()=>{
        touched.add(name);
        if(name==='email'){input.value=input.value.trim();state.registrationEmail=input.value;save();}
        render();
      });
      input.addEventListener('input',()=>{
        if(name==='email'&&normalizeEmail(input.value)!==duplicateEmail)duplicateEmail=null;
        $('#registration-request-error').hidden=true;
        render();
      });
    });
    $$('[data-password-toggle]').forEach(button=>button.addEventListener('click',()=>{
      const input=fields[button.dataset.passwordToggle];
      const show=input.type==='password';input.type=show?'text':'password';
      button.textContent=show?'Hide':'Show';button.setAttribute('aria-pressed',String(show));
    }));
    form.addEventListener('submit',event=>{
      event.preventDefault();if(pending)return;
      Object.keys(fields).forEach(name=>touched.add(name));render();
      if(Object.values(errors()).some(Boolean))return;
      const email=normalizeEmail(fields.email.value);
      fields.email.value=fields.email.value.trim();state.registrationEmail=fields.email.value;
      pending=true;$('#registration-status').textContent='Creating your account…';render();
      // This delay only makes the local review's loading/retry state observable.
      window.setTimeout(()=>{
        if($('#registration-outcome').value==='failure') {
          $('#registration-outcome').value='success';pending=false;
          $('#registration-request-error').textContent='Couldn’t create your account. Please try again.';
          $('#registration-request-error').hidden=false;$('#registration-status').textContent='';render();return;
        }
        if(Object.values(state.accounts).some(existing=>normalizeEmail(existing.profile.email||'')===email)) {
          duplicateEmail=email;pending=false;$('#registration-status').textContent='';render();return;
        }
        // Keep abandoned accounts so returning cannot overwrite an earlier identity.
        const id=state.accounts.newcomer?'newcomer-'+(Object.keys(state.accounts).length+1):'newcomer';
        state.accounts[id]={profile:{email},verified:false,complete:false,balance:config.registrationBonus,events:[{kind:'grant',amount:config.registrationBonus,label:'初回登録Bonus（暫定例・適用条件は提案）',date:new Date().toISOString()}],challenge:{issued:Date.now(),attempts:0,sends:[Date.now()]}};
        state.active=id;fields.password.value='';fields.confirmation.value='';go('verify');
      },700);
    });
  }
  function setupPasswordReset(form) {
    const fields=Object.fromEntries(['password','confirmation'].map(name=>[name,form.elements.namedItem(name)]));
    const touched=new Set();
    const submit=$('#reset-submit');
    function errors() {
      return {password:passwordRuleError(fields.password.value),confirmation:!fields.confirmation.value?'Confirm your password.':fields.confirmation.value!==fields.password.value?'Passwords do not match.':''};
    }
    function render() {
      const messages=errors();
      Object.entries(messages).forEach(([name,message])=>{
        const show=touched.has(name)&&!!message;
        const box=$('#'+name+'-error');box.textContent=show?message:'';box.hidden=!show;
        fields[name].setAttribute('aria-invalid',String(show));
      });
      submit.disabled=Object.values(messages).some(Boolean);
    }
    function clearSecrets() {
      Object.values(fields).forEach(input=>{input.value='';input.type='password';});touched.clear();
      $$('[data-password-toggle]').forEach(button=>{button.textContent='Show';button.setAttribute('aria-pressed','false');});render();
    }
    clearSecrets();window.addEventListener('pageshow',clearSecrets);
    Object.entries(fields).forEach(([name,input])=>{
      input.addEventListener('blur',()=>{touched.add(name);render();});
      input.addEventListener('input',render);
    });
    $$('[data-password-toggle]').forEach(button=>button.addEventListener('click',()=>{
      const input=fields[button.dataset.passwordToggle];const show=input.type==='password';input.type=show?'text':'password';button.textContent=show?'Hide':'Show';button.setAttribute('aria-pressed',String(show));
    }));
    form.addEventListener('submit',event=>{
      event.preventDefault();Object.keys(fields).forEach(name=>touched.add(name));render();
      if(Object.values(errors()).some(Boolean))return;
      // Recheck on submission: the link may expire or be replaced while this form is open.
      try {state=JSON.parse(localStorage.getItem(KEY))||state;}catch{/* Existing storage warning covers unavailable persistence. */}
      const reason=resetLinkProblem();
      if(reason){clearSecrets();location.href='password-link-error.html?reason='+reason;return;}
      const id=new URLSearchParams(location.search).get('token');state.resetLinks.find(link=>link.id===id).used=true;
      clearSecrets();state.active=null;state.target=null;go('login','パスワードを再設定しました。ログインしてください。');
    });
  }
  function setupAuthRequest(form, login) {
    const prefix=login?'login':'reset-request';
    const email=form.elements.namedItem('email');
    const password=login?form.elements.namedItem('password'):null;
    const submit=$('#'+prefix+'-submit');
    const requestError=$('#'+prefix+(login?'-request-error':'-error'));
    const touched=new Set();let pending=false,credentialsError=false;
    function show(box,message){box.textContent=message;box.hidden=!message;}
    function render(){
      const emailError=!email.value.trim()?'メールアドレスを入力してください。':!email.checkValidity()?'メールアドレスを正しく入力してください。':'';
      show($('#email-error'),touched.has('email')?emailError:'');
      email.setAttribute('aria-invalid',String(touched.has('email')&&!!emailError));
      if(password){
        const message=credentialsError?'メールアドレスまたはパスワードが正しくありません。':!password.value?'パスワードを入力してください。':'';
        show($('#password-error'),touched.has('password')?message:'');
        password.setAttribute('aria-invalid',String(touched.has('password')&&!!message));
        password.readOnly=pending;
      }
      email.readOnly=pending;submit.disabled=pending;
      submit.textContent=pending?(login?'ログイン中…':'送信中…'):(login?'ログイン':'再設定メールを送信');
      form.setAttribute('aria-busy',String(pending));
      return !emailError&&(!password||!!password.value);
    }
    for(const input of [email,password].filter(Boolean)){
      input.addEventListener('blur',()=>{touched.add(input.name);if(input===email)email.value=email.value.trim();render();});
      input.addEventListener('input',()=>{credentialsError=false;requestError.hidden=true;render();});
    }
    render();
    form.addEventListener('submit',event=>{
      event.preventDefault();if(pending)return;
      touched.add('email');if(login)touched.add('password');credentialsError=false;
      if(!render())return;
      const identity=normalizeEmail(email.value);email.value=email.value.trim();
      show(requestError,'');pending=true;render();
      window.setTimeout(()=>{
        const outcome=$('#'+prefix+'-outcome').value;
        if(outcome==='failure'){
          $('#'+prefix+'-outcome').value='success';pending=false;
          show(requestError,login?'ログインできませんでした。もう一度お試しください。':'送信できませんでした。もう一度お試しください。');render();return;
        }
        const id=Object.keys(state.accounts).find(id=>normalizeEmail(state.accounts[id].profile.email||'')===identity);
        if(login){
          if(!id||outcome==='credentials'){credentialsError=true;pending=false;render();return;}
          state.active=id;const destination=state.target;if(state.accounts[id].verified)state.target=null;
          password.value='';go(!state.accounts[id].verified?'verify':destination||'home','デモにログインしました。入力パスワードの認証・保存はしません。');return;
        }
        // Local review request history applies equally to known and unknown email addresses.
        // Failed network simulations do not count; production failure accounting remains design work.
        state.resetRequests=state.resetRequests||{};
        const now=Date.now(),sends=(state.resetRequests[identity]||[]).filter(time=>now-time<3600000);
        if(sends.length&&now-sends.at(-1)<60000){pending=false;show(requestError,'60秒以上あけて、もう一度お試しください。');render();return;}
        if(sends.length>=5){pending=false;show(requestError,'送信回数の上限です。時間をあけてお試しください。');render();return;}
        state.resetRequests[identity]=[...sends,now];state.lastResetRequest={linkId:null};
        if(id){
          state.resetLinks=state.resetLinks||[];
          state.resetLinks.filter(link=>link.email===identity&&!link.used).forEach(link=>{link.replaced=true;});
          state.resetSequence=(state.resetSequence||0)+1;
          const linkId='demo-reset-'+state.resetSequence;
          state.resetLinks.push({id:linkId,email:identity,issued:now,used:false,replaced:false});
          state.lastResetRequest.linkId=linkId;
        }
        go('password-email');
      },700);
    });
  }
  let verificationPending=false;
  let resendTimer=null;
  function updateResendCountdown(){
    const button=$('#verification-resend');if(!button)return;
    const challenge=account()?.challenge;
    const issued=challenge?.issued;
    const now=Date.now();
    const limitMessage='送信回数の上限に達しました。しばらくしてからお試しください。';
    const limited=(challenge?.sends||[]).filter(time=>now-time<3600000).length>=5;
    const seconds=issued===undefined?0:Math.max(0,Math.ceil((60000-(now-issued))/1000));
    button.disabled=verificationPending||limited||seconds>0;
    button.textContent=seconds>0?`再送する（あと${seconds}秒）`:'コードを再送する';
    if(limited)$('#resend-status').textContent=limitMessage;
    else if($('#resend-status').textContent===limitMessage)$('#resend-status').textContent='';
  }
  function startResendCountdown(){
    updateResendCountdown();
    if(page==='verify'&&resendTimer===null)resendTimer=window.setInterval(updateResendCountdown,1000);
  }
  if(page==='verify'){
    startResendCountdown();
    window.addEventListener('pagehide',()=>{window.clearInterval(resendTimer);resendTimer=null;});
    window.addEventListener('pageshow',startResendCountdown);
  }
  const codeBoxes=$$('[data-code-digit]');
  const verifyForm=$('form[data-action=verify]');
  const verifySubmit=verifyForm?.querySelector('button');
  function updateVerifyButton(){
    if(!verifySubmit)return;
    verifySubmit.disabled=verificationPending||!codeBoxes.every(input=>/^[0-9]$/.test(input.value))||(account()?.challenge?.attempts??0)>=5;
    verifySubmit.textContent=verificationPending?'認証中…':'認証する';
    codeBoxes.forEach(input=>{input.readOnly=verificationPending;});
    verifyForm.setAttribute('aria-busy',String(verificationPending));
  }
  updateVerifyButton();
  function fillCode(start,text) {
    const digits=text.replace(/[^0-9]/g,'').slice(0,6-start);
    if(!digits)return;
    [...digits].forEach((digit,offset)=>{codeBoxes[start+offset].value=digit;});
    codeBoxes[Math.min(start+digits.length,5)].focus();
    updateVerifyButton();
  }
  codeBoxes.forEach((input,index)=>{
    input.addEventListener('focus',()=>input.select());
    input.addEventListener('input',()=>{
      const digits=input.value.replace(/[^0-9]/g,'');
      input.value=digits.slice(0,1);
      if(digits.length>1)fillCode(index,digits);
      else if(digits&&index<5)codeBoxes[index+1].focus();
      updateVerifyButton();
    });
    input.addEventListener('paste',event=>{event.preventDefault();fillCode(index,event.clipboardData?.getData('text')||'');});
    input.addEventListener('keydown',event=>{
      if(event.key==='Backspace'&&!input.value&&index>0){event.preventDefault();codeBoxes[index-1].value='';codeBoxes[index-1].focus();updateVerifyButton();}
      if(event.key==='ArrowLeft'&&index>0){event.preventDefault();codeBoxes[index-1].focus();}
      if(event.key==='ArrowRight'&&index<5){event.preventDefault();codeBoxes[index+1].focus();}
    });
  });
  function updateOccupationSummary(){
    const summary=$('#occupation-summary');if(!summary)return;
    const selected=$$('[data-occupation-option]').filter(option=>option.checked).map(option=>option.value);
    summary.textContent=selected.length?selected.join('、'):'職種を選択（複数可）';
  }
  $$('[data-occupation-option]').forEach(option=>option.addEventListener('change',updateOccupationSummary));
  function setupProfileForm(form,action){
    let pending=false;
    const submit=form.querySelector('button');
    const saveError=form.querySelector('.error');
    const fields=['displayName','prefecture','city','occupations','introduction','skills','experience','credits','portfolio','workAreas','company','website','companyIntroduction','companyCredits','legalName'];
    const touched=new Set();
    const get=name=>form.elements.namedItem(name);
    const selected=()=>$$('[data-occupation-option]').filter(option=>option.checked).map(option=>option.value);
    const profile=account()?.profile;
    if(profile)Object.entries(profile).forEach(([name,value])=>{const input=get(name);if(input&&!Array.isArray(value)&&['INPUT','SELECT','TEXTAREA'].includes(input.tagName))input.value=value;});
    $$('[data-occupation-option]').forEach(option=>{option.checked=(profile?.occupations||[]).includes(option.value);});updateOccupationSummary();
    function errors(){
      const messages={};
      const prefectures=new Set($$('[data-prefecture-option]').map(option=>option.value));
      if(!get('displayName').value.trim())messages.displayName='表示名を入力してください。';
      if(!prefectures.has(get('prefecture').value))messages.prefecture='都道府県を選択してください。';
      if(!selected().length)messages.occupations='職種を一つ以上選択してください。';
      for(const name of ['portfolio','website']){const input=get(name);if(input&&input.value.trim()&&!input.checkValidity())messages[name]='URLを正しく入力してください。';}
      return messages;
    }
    function render(){
      const messages=errors();
      fields.forEach(name=>{const box=$('#profile-'+name+'-error');if(!box)return;const message=touched.has(name)?messages[name]||'':'';box.textContent=message;box.hidden=!message;const input=get(name);if(input?.setAttribute)input.setAttribute('aria-invalid',String(!!message));if(name==='occupations')$$('[data-occupation-option]').forEach(option=>option.setAttribute('aria-invalid',String(!!message)));});
      return messages;
    }
    fields.filter(name=>name!=='occupations').forEach(name=>{const input=get(name);if(!input)return;input.addEventListener('blur',()=>{touched.add(name);render();});input.addEventListener('input',render);input.addEventListener('change',render);});
    $$('[data-occupation-option]').forEach(option=>{option.addEventListener('change',()=>{touched.add('occupations');updateOccupationSummary();render();});option.addEventListener('blur',()=>{touched.add('occupations');render();});});
    render();
    form.addEventListener('submit',event=>{
      event.preventDefault();if(pending)return;fields.forEach(name=>touched.add(name));
      if(Object.keys(render()).length)return;
      if(!account()){state.target=page;go('login');return;}
      const data=Object.fromEntries(new FormData(form));
      data.occupations=selected();data.occupation=data.occupations.join('、');
      data.displayName=data.displayName.trim();data.city=(data.city||'').trim();data.location=data.prefecture+data.city;
      for(const name of fields){if(typeof data[name]==='string'&&!data[name].trim())data[name]='';}
      const commit=()=>{Object.assign(account().profile,data);account().complete=true;if(action==='profile')finishAccount();else go('my-profile','プロフィールを更新しました。');};
      if(action==='profile'){commit();return;}
      function pendingControls(value){
        pending=value;submit.disabled=value;form.setAttribute('aria-busy',String(value));
        fields.filter(name=>name!=='occupations').forEach(name=>{const input=get(name);if(!input)return;if(input.tagName==='SELECT')input.disabled=value;else input.readOnly=value;});
        $$('[data-occupation-option]').forEach(option=>{option.disabled=value;});
      }
      saveError.hidden=true;pendingControls(true);
      window.setTimeout(()=>{
        if($('#profile-save-outcome').value==='session-expired'){
          pendingControls(false);state.active=null;state.target=null;go('login');return;
        }
        if($('#profile-save-outcome').value==='failure'){
          $('#profile-save-outcome').value='success';pendingControls(false);
          saveError.textContent='保存できませんでした。もう一度お試しください。';saveError.hidden=false;return;
        }
        pendingControls(false);commit();
      },700);
    });
  }
  $$('form').forEach(form=>{
    const action=form.dataset.action;
    if(action==='profile'||action==='profile-edit'){setupProfileForm(form,action);return;}
    if(action==='register'){setupRegistration(form);return;}
    if(action==='reset-password'){setupPasswordReset(form);return;}
    if(action==='login'||action==='reset-request'){setupAuthRequest(form,action==='login');return;}
    let values=null;
    if(action==='job-draft') values=state.draft;
    if(action==='job-edit') values=state.job;
    if(action==='invoice') values=state.invoice;
    if(action==='preferences') $$('input[type=checkbox]').forEach(input=>{if(account()?.preferences)input.checked=!!account().preferences[input.name];});
    if(values) Object.entries(values).forEach(([key,value])=>{const input=form.elements.namedItem(key);if(input && !Array.isArray(value) && ['INPUT','TEXTAREA','SELECT'].includes(input.tagName))input.value=value;});
    form.addEventListener('submit',event=>{
      event.preventDefault();
      if(!form.reportValidity()) return;
      const formData=new FormData(form);
      const data=Object.fromEntries(formData);
      if(action==='verify'){
        if(verificationPending)return;
        const code=codeBoxes.map(input=>input.value).join('');
        if(!/^[0-9]{6}$/.test(code)){fail('6桁の確認コードを入力してください。',form);return;}
        verificationPending=true;updateVerifyButton();updateResendCountdown();
        window.setTimeout(()=>{
          try {
          if(!/^[0-9]{6}$/.test(code)){fail('6桁の確認コードを入力してください。',form);return;}
          if(!account()) {fail('新規登録またはログインからお進みください。',form);return;}
          if($('#verification-outcome')?.value==='failure'){
            $('#verification-outcome').value='success';fail('確認できませんでした。もう一度お試しください。',form);return;
          }
          const challenge=account().challenge;
          if(challenge.attempts>=5){fail('確認コードが無効になりました。再送してください。',form);return;}
          if(Date.now()-challenge.issued>=600000){fail('確認コードの有効期限が切れました。再送してください。',form);return;}
          if(challenge.used){fail('このコードは使用済みです。',form);return;}
          if(code!=='042817') {challenge.attempts++;save();updateVerifyButton();fail(challenge.attempts>=5?'確認コードが無効になりました。再送してください。':'確認コードが正しくありません。',form);return;}
          challenge.used=true;account().verified=true;state.verificationNotice=true;
          if(account().complete){const target=state.target;state.target=null;go(target||'home');}
          else go('profile-setup');
          return;
          } finally {
            verificationPending=false;updateVerifyButton();updateResendCountdown();
          }
        },700);
        return;
      }
      switch(action) {
        case 'password-change':
          if(data.password!==data.confirmation){fail('パスワードが一致しません。',form);break;}
          form.reset();go('settings','変更完了画面のデモです。パスワードは保存・変更していません。');break;
        case 'job-draft':case 'job-edit': {
          if(!need(page))break;
          if(action==='job-edit'&&!ownership(page))break;
          if(!Number.isInteger(Number(data.compensation))||Number(data.compensation)<=0||!Number.isInteger(Number(data.headcount))||Number(data.headcount)<1){fail('報酬は正の整数円、募集人数は1以上の整数で入力してください。',form);break;}
          if(data.end<data.start){fail('終了日は開始日以降にしてください。',form);break;}
          if(action==='job-draft'){state.draft={...data,owner:state.active,status:'公開中',charged:false};go('job-review');}
          else {Object.assign(state.job,data);go('job-manage','募集内容を更新しました（課金条件は提案）。');}break;
        }
        case 'search': {
          const keyword=data.keyword.trim().toLowerCase();
          const match=(!keyword||`${state.job.title} ${state.job.description} ${state.job.occupation}`.toLowerCase().includes(keyword))&&(!data.location||state.job.location.includes(data.location));
          $('#search-results').hidden=!match;$('#no-results').hidden=match;break;
        }
        case 'apply': {
          if(!need('application-new'))break;
          if(state.active===state.job.owner){fail('自分の募集には応募できません。画面一覧で応募者へ切り替えてください。',form);break;}
          if(state.application?.applicant===state.active){fail('この募集には既に応募しています。取り下げ後の再応募ルールは確認待ちです。',form);break;}
          if(state.job.status!=='公開中'||state.job.removed){fail('現在、この募集への応募を受け付けていません（状態ルールは提案）。',form);break;}
          if(!data.introduction.trim()){fail('自己紹介・応募理由を入力してください。',form);break;}
          state.application={applicant:state.active,status:'Submitted',introduction:data.introduction};go('application-sent');break;
        }
        case 'application-status':if(!ownership(page))break;if(!state.application){fail('応募がありません。',form);break;}state.application.status=data.status;go('applicant-detail','応募状況を更新しました。通知メールは送信しません。');break;
        case 'message':if(!need('conversation'))break;if(!data.message.trim()){fail('メッセージを入力してください。',form);break;}state.messages.push({name:account().profile.displayName,text:data.message});save();form.reset();renderMessages();break;
        case 'invoice':if(!need('invoice-new'))break;if(!Number.isInteger(Number(data.amount))||Number(data.amount)<=0){fail('サンプル金額は正の整数円で入力してください。',form);break;}state.invoice={...data};go('invoice-preview');break;
        case 'preferences':if(!account()){go('login');break;}account().preferences={applications:!!data.applications,messages:!!data.messages};go('settings','デモのメール設定を保存しました。');break;
      }
    });
  });
  $$('[data-gate]').forEach(el=>el.addEventListener('click',event=>{if(!need('application-new'))event.preventDefault();}));
  $$('button[data-action]').forEach(button=>button.addEventListener('click',()=>{
    switch(button.dataset.action) {
      case 'back-register':state.registrationEmail=account()?.profile.email||state.registrationEmail||'';state.active=null;go('register');break;
      case 'skip':go('job-list','閲覧はできます。応募・公開の前には基本プロフィールを入力してください。');break;
      case 'resend': {
        if(verificationPending)break;
        if(!account()) {go('register');break;}
        const now=Date.now(), previous=account().challenge;
        const sends=(previous?.sends||[]).filter(time=>now-time<3600000);
        if(previous && now-previous.issued<60000){$('#resend-status').textContent='前回の送信から60秒以上あけてください。';break;}
        if(sends.length>=5){$('#resend-status').textContent='送信回数の上限に達しました。しばらくしてからお試しください。';updateResendCountdown();break;}
        if($('#verification-resend-outcome')?.value==='failure'){
          $('#verification-resend-outcome').value='success';$('#resend-status').textContent='送信できませんでした。もう一度お試しください。';break;
        }
        account().challenge={issued:now,attempts:0,sends:[...sends,now]};save();updateResendCountdown();
        codeBoxes.forEach(input=>{input.value='';});
        const error=verifyForm?.querySelector('.error');if(error){error.textContent='';error.hidden=true;}
        updateVerifyButton();codeBoxes[0]?.focus();
        $('#resend-status').textContent='確認コードを再送しました。';updateResendCountdown();break;
      }
      case 'publish': {
        if(!need('job-review'))break;
        if(!state.draft){go('job-new','募集内容を入力してください。');break;}
        if(state.draft.charged){go('job-published','このデモの募集は公開済みです。追加の消費はありません。');break;}
        if(account().balance<config.listingCost){go('points-insufficient');break;}
        button.disabled=true;account().balance-=config.listingCost;account().events.push({kind:'spend',amount:config.listingCost,label:'求人公開',date:new Date().toISOString()});state.draft.charged=true;state.job={...state.draft};go('job-published');break;
      }
      case 'withdraw':if(!need('withdraw'))break;if(!state.application||state.application.applicant!==state.active){go('my-applications','取り下げできる応募がありません。');break;}state.application.status='Withdrawn';go('application-detail','応募を取り下げました（再応募ルールは確認待ち）。');break;
      case 'close-job':case 'complete-job':if(!ownership(page))break;state.job.status=button.dataset.action==='close-job'?'募集締切':'作業完了';go('job-manage','状態を変更しました。支払いを確認したものではありません。');break;
      case 'generate-invoice':if(!state.invoice){go('invoice-new');break;}go('invoice-document');break;
      case 'print':window.print();break;
      case 'logout':state.active=null;state.target=null;go('job-list','ログアウトしました。');break;
      case 'suspend':state.suspended=true;go('admin-user','利用停止の表示を更新しました。');break;
      case 'remove-job':state.job.removed=true;go('admin-job','掲載削除の表示を更新しました。Points返還は行っていません。');break;
    }
  }));
})();
