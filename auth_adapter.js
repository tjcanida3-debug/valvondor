(function(){
 const cfg=window.VALVONDOR_AUTH_CONFIG||{};const gate=document.getElementById('accountGate'),status=document.getElementById('accountStatus'),badge=document.getElementById('accountBackendBadge'),bar=document.getElementById('accountBar'),name=document.getElementById('accountName');
 const ready=!!(cfg.supabaseUrl&&cfg.supabaseAnonKey);
 function setStatus(msg,good=false){if(status){status.textContent=msg;status.style.color=good?'#bfe1af':'#b8ad9a'}}
 if(ready){badge.textContent='SUPABASE CONFIGURED';badge.style.color='#bfe1af';setStatus('Supabase credentials are present. The connection code is ready to be enabled.')}
 function showTab(which){document.getElementById('showLoginTab').classList.toggle('active',which==='login');document.getElementById('showRegisterTab').classList.toggle('active',which==='register');document.getElementById('loginForm').classList.toggle('active',which==='login');document.getElementById('registerForm').classList.toggle('active',which==='register')}
 document.getElementById('showLoginTab')?.addEventListener('click',()=>showTab('login'));document.getElementById('showRegisterTab')?.addEventListener('click',()=>showTab('register'));
 function need(){if(!ready){setStatus('Real accounts are prepared, but Supabase is not connected yet. Add the project URL and anon key in js/auth_config.js.');return false}return true}
 document.getElementById('loginForm')?.addEventListener('submit',e=>{e.preventDefault();if(!need())return;setStatus('Supabase login will activate after we add the Supabase client library and database policies.')});
 document.getElementById('registerForm')?.addEventListener('submit',e=>{e.preventDefault();if(!need())return;const u=(document.getElementById('registerUsername')?.value||'').trim();if(u.length<3){setStatus('Username must be at least 3 characters.');return}setStatus('Supabase registration will activate after we add the Supabase client library and database policies.')});
 document.getElementById('accountLogoutBtn')?.addEventListener('click',()=>{bar.hidden=true;gate?.classList.add('open');setStatus('Logged out. Real session logout will be wired to Supabase.')});
 window.ValvondorAccount={config:cfg,backendReady:ready,openGate(){gate?.classList.add('open')},closeGate(){gate?.classList.remove('open')},setSignedIn(username){gate?.classList.remove('open');bar.hidden=false;name.textContent=username||'Player'},setStatus};
})();
