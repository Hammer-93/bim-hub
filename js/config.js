const SUPABASE_URL = 'https://oyvwattigkqnimlmrqnj.supabase.co';
const SUPABASE_KEY = 'sb_publishable_kcQtVjFP0m4ecWySEiwdEQ_rKFz1nn6';
const HDRS = {
  'apikey': SUPABASE_KEY,
  'Authorization': 'Bearer ' + SUPABASE_KEY,
  'Content-Type': 'application/json',
  'Prefer': 'return=representation'
};
const BRANCHES = ['本社','首都圏','大阪','九州','東北','名古屋','札幌','四国','静岡','広島','北陸','ベトナム営業所'];
const DESIGNS  = ['自','他'];
const TASK_TYPES = ['パース・動画','意匠モデル','構造モデル','清算モデル','図面','施工ステップ'];
const PASTEL_COLORS = [
  '#a8dadc','#b5ead7','#ffdac1','#c7ceea','#ffb7b2','#e2f0cb',
  '#bee5eb','#d4b8e0','#f7c59f','#a0c4ff','#bde0fe','#ffcfd2',
  '#cdb4db','#ffc8dd','#d0f4de','#e9c46a','#8ecae6','#95d5b2'
];

let allProjects  = [];
let allTasks     = [];
let allUsers     = [];
let projColorMap = {};

async function loadAllData() {
  const [pR, tR, uR] = await Promise.all([
    fetch(SUPABASE_URL+'/rest/v1/projects?select=*&order=created_at.desc', {headers:HDRS}),
    fetch(SUPABASE_URL+'/rest/v1/project_tasks?select=*', {headers:HDRS}),
    fetch(SUPABASE_URL+'/rest/v1/users?select=*&order=name.asc', {headers:HDRS}),
  ]);
  allProjects = await pR.json();
  allTasks    = await tR.json();
  allUsers    = await uR.json();
  allProjects.forEach((p,i) => {
    projColorMap[p.id] = p.color || PASTEL_COLORS[i % PASTEL_COLORS.length];
  });
}

function fmt(d) {
  if (!d) return '';
  const dt = d instanceof Date ? d : new Date(d);
  if (isNaN(dt)) return '';
  return dt.toISOString().split('T')[0];
}
function getDaysArray(start, end) {
  const days = [];
  let cur = new Date(start);
  const endD = new Date(end);
  while (cur <= endD) {
    days.push(fmt(cur));
    cur.setDate(cur.getDate()+1);
  }
  return days;
}
function isWeekend(d) {
  const dt = new Date(d);
  return dt.getDay()===0 || dt.getDay()===6;
}
function showToast(msg, type='success') {
  let t = document.getElementById('toast');
  if (!t) {
    t = document.createElement('div');
    t.id = 'toast';
    document.body.appendChild(t);
  }
  t.textContent = msg;
  t.className = 'toast '+type+' show';
  setTimeout(()=>t.classList.remove('show'), 3200);
}
function showTooltip(e, html) {
  let t = document.getElementById('tooltip');
  if (!t) {
    t = document.createElement('div');
    t.id = 'tooltip';
    t.className = 'tooltip';
    document.body.appendChild(t);
  }
  t.innerHTML = html;
  t.style.display = 'block';
  t.style.left = (e.clientX+12)+'px';
  t.style.top  = (e.clientY-10)+'px';
}
function hideTooltip() {
  const t = document.getElementById('tooltip');
  if (t) t.style.display = 'none';
}
document.addEventListener('mousemove', e => {
  const t = document.getElementById('tooltip');
  if (t && t.style.display==='block') {
    t.style.left = (e.clientX+12)+'px';
    t.style.top  = (e.clientY-10)+'px';
  }
});
function initTopbar() {
  const role = localStorage.getItem('user_role') || 'Staff';
  const name = localStorage.getItem('user_name') || 'User';
  if (!localStorage.getItem('user_email')) {
    window.location.href = 'index.html'; return;
  }
  document.getElementById('topName').textContent   = name;
  document.getElementById('topAvatar').textContent = name.substring(0,2).toUpperCase();
  const rb = document.getElementById('topRole');
  rb.textContent = role;
  rb.className = 'role-badge '+(role==='Admin'?'role-admin':'role-staff');
  if (role==='Admin') {
    document.querySelectorAll('.admin-only').forEach(el => el.style.display='flex');
  }
}
function logout() {
  if (confirm('Dang xuat?')) {
    localStorage.clear();
    window.location.href = 'index.html';
  }
}