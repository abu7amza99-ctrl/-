// script.js - نسخة متكاملة وآمنة
(() => {
  const LS_FILES = "my_design_files_v1";
  const LS_COLORS = "my_design_colors_v1";
  const LS_THEME = "my_design_theme_v1";
  const LS_PASSWORD = "my_design_master_v1";
  const LS_BG_IMAGE = "my_design_bgimage_v1";
  const DEFAULT_MASTER = "asd321321";

  function getMaster(){ return localStorage.getItem(LS_PASSWORD) || DEFAULT_MASTER; }
  function persistFiles(map){ localStorage.setItem(LS_FILES, JSON.stringify(map)); }
  function persistColors(obj){ localStorage.setItem(LS_COLORS, JSON.stringify(obj)); }
  function persistTheme(v){ localStorage.setItem(LS_THEME, v); }
  function persistBgImage(d){ if(!d) localStorage.removeItem(LS_BG_IMAGE); else localStorage.setItem(LS_BG_IMAGE, d); }

  function fileToDataURL(file){
    return new Promise((resolve,reject)=>{
      const r = new FileReader();
      r.onload = ()=> resolve(r.result);
      r.onerror = ()=> reject(new Error("فشل قراءة الملف"));
      r.readAsDataURL(file);
    });
  }

  document.addEventListener("DOMContentLoaded", () => {
    // عناصر DOM الأساسية (آمنة: وجودها يتم التحقق منه)
    const welcome = document.getElementById("welcomeScreen");
    const startBtn = document.getElementById("startBtn");
    const skipBtn = document.getElementById("skipBtn");

    const sidebar = document.getElementById("sidebar");
    const toggleSidebar = document.getElementById("toggleSidebar");
    const closeSidebarBtn = document.getElementById("closeSidebarBtn");
    const sectionsList = document.getElementById("sectionsList");
    const main = document.getElementById("main");
    const searchInput = document.getElementById("searchInput");

    const viewer = document.getElementById("viewer");
    const viewerTitle = document.getElementById("viewerTitle");
    const viewerBody = document.getElementById("viewerBody");
    const closeViewer = document.getElementById("closeViewer");
    const downloadBtn = document.getElementById("downloadBtn");
    const copyBtn = document.getElementById("copyBtn");

    const adminBtn = document.getElementById("adminBtn");
    const loginModal = document.getElementById("loginModal");
    const adminModal = document.getElementById("adminModal");
    const adminPassword = document.getElementById("adminPassword");
    const loginBtn = document.getElementById("loginBtn");
    const closeLogin = document.getElementById("closeLogin");
    const closeAdmin = document.getElementById("closeAdmin");

    const newSectionName = document.getElementById("newSectionName");
    const addSectionBtn = document.getElementById("addSectionBtn");
    const editSectionSelect = document.getElementById("editSectionSelect");
    const renameSectionInput = document.getElementById("renameSectionInput");
    const renameSectionBtn = document.getElementById("renameSectionBtn");
    const deleteSectionBtn = document.getElementById("deleteSectionBtn");

    const fileSectionSelect = document.getElementById("fileSectionSelect");
    const fileNameInput = document.getElementById("fileNameInput");
    const fileUrlInput = document.getElementById("fileUrlInput");
    const fileUploadInput = document.getElementById("fileUploadInput");
    const fileTypeSelect = document.getElementById("fileTypeSelect");
    const saveFileBtn = document.getElementById("saveFileBtn");
    const clearUploads = document.getElementById("clearUploads");
    const sectionFilesList = document.getElementById("sectionFilesList");

    const fileSectionFilter = document.getElementById("fileSectionFilter");
    const fileEditSelect = document.getElementById("fileEditSelect");

    const headerColor = document.getElementById("headerColor");
    const textColor = document.getElementById("textColor");
    const bgColor = document.getElementById("bgColor");
    const saveColors = document.getElementById("saveColors");
    const bgImageUrl = document.getElementById("bgImageUrl");
    const bgImageUpload = document.getElementById("bgImageUpload");
    const saveBgImage = document.getElementById("saveBgImage");
    const clearBgImage = document.getElementById("clearBgImage");

    const themeSelect = document.getElementById("themeSelect");
    const themePreview = document.getElementById("themePreview");
    const saveTheme = document.getElementById("saveTheme");

    const changeOldPass = document.getElementById("changeOldPass");
    const changeNewPass = document.getElementById("changeNewPass");
    const changeConfirmPass = document.getElementById("changeConfirmPass");
    const changePassBtn = document.getElementById("changePassBtn");
    const changePassMsg = document.getElementById("changePassMsg");

    // الحالة: filesMap: { sectionName: [ {name,url,type}, ... ], ... }
    let filesMap = {};
    try { filesMap = JSON.parse(localStorage.getItem(LS_FILES) || "{}"); } catch(e){ filesMap = {}; }

    // الألوان/ثيم/خلفية
    function applyColors(obj){
      if(!obj) return;
      if(obj.header) document.documentElement.style.setProperty("--header", obj.header);
      if(obj.text) document.documentElement.style.setProperty("--text", obj.text);
      if(obj.bg) document.documentElement.style.setProperty("--bg", obj.bg);
    }
    function loadColors(){ try{ const c = JSON.parse(localStorage.getItem(LS_COLORS)||"null"); if(c) applyColors(c); }catch(e){} }
    function loadTheme(){ const t = localStorage.getItem(LS_THEME); if(t) document.body.setAttribute("data-theme", t); }
    function applyBgImage(dataUrl){
      if(!dataUrl){ document.body.style.backgroundImage=""; return; }
      document.body.style.backgroundImage = `url(${dataUrl})`;
      document.body.style.backgroundSize = "cover";
      document.body.style.backgroundPosition = "center";
    }
    function loadBgImage(){ const d = localStorage.getItem(LS_BG_IMAGE); if(d) applyBgImage(d); }

    // عرض / إخفاء شاشة الترحيب
    startBtn?.addEventListener("click", ()=>{ if(welcome) welcome.style.display="none"; });
    skipBtn?.addEventListener("click", ()=>{ if(welcome) welcome.style.display="none"; });
    setTimeout(()=>{ if(welcome) welcome.style.display="none"; }, 6000);

    // sidebar overlay & toggle
    let sidebarOverlay = null;
    function manageSidebarOverlay(show){
      if(show){
        if(!sidebarOverlay){
          sidebarOverlay = document.createElement("div");
          sidebarOverlay.className = "sidebar-overlay";
          sidebarOverlay.onclick = ()=>{ if(sidebar){ sidebar.setAttribute("aria-hidden","true"); manageSidebarOverlay(false); } };
          document.body.appendChild(sidebarOverlay);
        }
      } else {
        if(sidebarOverlay){ sidebarOverlay.remove(); sidebarOverlay=null; }
      }
    }
    toggleSidebar?.addEventListener("click", ()=>{
      const hidden = sidebar?.getAttribute("aria-hidden")==="true";
      sidebar?.setAttribute("aria-hidden", hidden ? "false":"true");
      manageSidebarOverlay(!hidden);
    });
    closeSidebarBtn?.addEventListener("click", ()=>{ sidebar?.setAttribute("aria-hidden","true"); manageSidebarOverlay(false); });

    // render sections list
    function renderSectionsList(){
      if(!sectionsList) return;
      sectionsList.innerHTML=""; editSectionSelect && (editSectionSelect.innerHTML=""); fileSectionSelect && (fileSectionSelect.innerHTML=""); fileSectionFilter && (fileSectionFilter.innerHTML=""); 
      const keys = Object.keys(filesMap);
      if(keys.length===0){
        sectionsList.innerHTML = "<li>لا توجد أقسام بعد</li>";
        editSectionSelect && editSectionSelect.appendChild(new Option("",""));
        fileSectionSelect && fileSectionSelect.appendChild(new Option("",""));
        fileSectionFilter && fileSectionFilter.appendChild(new Option("",""));
        return;
      }
      // order deterministic
      keys.forEach(k=>{
        const li = document.createElement("li"); li.textContent = k;
        li.addEventListener("click", ()=>{ openSection(k); sidebar?.setAttribute("aria-hidden","true"); manageSidebarOverlay(false); });
        sectionsList.appendChild(li);
        if(editSectionSelect) editSectionSelect.appendChild(new Option(k,k));
        if(fileSectionSelect) fileSectionSelect.appendChild(new Option(k,k));
        if(fileSectionFilter) fileSectionFilter.appendChild(new Option(k,k));
      });
      // update file edit select for current filter
      const sel = fileSectionFilter?.value || (Object.keys(filesMap)[0]||"");
      populateFileEditSelect(sel);
      updateSectionFilesList(fileSectionFilter?.value);
    }

    // فتح قسم في المحتوى الرئيسي
    function openSection(name){
      if(!main) return;
      main.dataset.currentSection = name;
      main.innerHTML="";
      const header = document.createElement("h2"); header.textContent = name; main.appendChild(header);
      const items = filesMap[name] || [];
      if(items.length===0){ const p = document.createElement("p"); p.className="placeholder"; p.textContent = `لا توجد ملفات في ${name}`; main.appendChild(p); return; }
      const grid = document.createElement("div"); grid.className="grid";
      items.forEach(f=>{
        const c = document.createElement("div"); c.className="card";
        if(f.type && typeof f.type === 'string' && f.type.startsWith("image")){ c.innerHTML = `<img src="${f.url}" alt="${f.name}"><p>${f.name}</p>`; c.addEventListener("click", ()=>openViewer(f)); }
        else{ c.innerHTML = `<p>📄 ${f.name}</p>`; c.addEventListener("click", ()=>openViewer(f)); }
        grid.appendChild(c);
      });
      main.appendChild(grid);
    }

    // viewer modal
    function openViewer(file){
      if(!viewer) return;
      viewer.setAttribute("aria-hidden","false");
      viewerTitle.textContent = file.name;
      viewerBody.innerHTML = "";
      if(file.type && typeof file.type === 'string' && file.type.startsWith("image")){ const img = document.createElement("img"); img.src=file.url; img.style.maxWidth="100%"; viewerBody.appendChild(img); }
      else { const p = document.createElement("p"); p.textContent = file.name; viewerBody.appendChild(p); }
      downloadBtn && (downloadBtn.onclick = ()=>{ const a=document.createElement("a"); a.href=file.url; a.download=file.name||"file"; a.click(); });
      copyBtn && (copyBtn.onclick = ()=>{ navigator.clipboard.writeText(file.url||""); alert("تم نسخ الرابط"); });
    }
    closeViewer?.addEventListener("click", ()=> viewer?.setAttribute("aria-hidden","true"));

    // auth: admin button opens login modal only
    adminBtn?.addEventListener("click", ()=> {
      loginModal?.removeAttribute("aria-hidden");
      document.getElementById("loginError") && (document.getElementById("loginError").textContent = "");
      adminPassword && (adminPassword.value = "");
    });
    closeLogin?.addEventListener("click", ()=> loginModal?.setAttribute("aria-hidden","true"));
    loginBtn?.addEventListener("click", ()=>{
      if(!adminPassword) return;
      if(adminPassword.value === getMaster()){
        loginModal?.setAttribute("aria-hidden","true");
        adminModal?.removeAttribute("aria-hidden");
        adminPassword.value = "";
        renderSectionsList();
        loadAdminValues();
      } else {
        document.getElementById("loginError") && (document.getElementById("loginError").textContent = "❌ كلمة المرور غير صحيحة");
      }
    });
    closeAdmin?.addEventListener("click", ()=> adminModal?.setAttribute("aria-hidden","true"));

    // sections CRUD
    addSectionBtn?.addEventListener("click", ()=>{
      const n = (newSectionName.value||"").trim(); if(!n) return alert("ادخل اسم القسم");
      if(!filesMap[n]) filesMap[n] = [];
      newSectionName.value = "";
      persistFiles(filesMap); renderSectionsList();
    });
    renameSectionBtn?.addEventListener("click", ()=>{
      const oldName = editSectionSelect?.value; const newName = (renameSectionInput?.value||"").trim();
      if(!oldName || !newName) return alert("اختر قسم وادخل اسم جديد");
      if(filesMap[newName]) return alert("اسم موجود مسبقاً");
      filesMap[newName] = filesMap[oldName] || [];
      delete filesMap[oldName];
      persistFiles(filesMap); renderSectionsList(); renameSectionInput.value = "";
    });
    deleteSectionBtn?.addEventListener("click", ()=>{
      const sec = editSectionSelect?.value; if(!sec) return alert("اختر قسم");
      if(!confirm(`هل تريد حذف القسم "${sec}"؟`)) return;
      delete filesMap[sec];
      persistFiles(filesMap); renderSectionsList(); main.innerHTML='<p class="placeholder">اختر قسماً من القائمة</p>';
    });

    // save file (upload or url)
    saveFileBtn?.addEventListener("click", ()=>{
      const sec = fileSectionSelect?.value; if(!sec) { alert("اختر قسم"); return; }
      const name = (fileNameInput?.value||"").trim() || "ملف بدون اسم";
      const typeSel = fileTypeSelect?.value || "file";
      if(fileUploadInput && fileUploadInput.files && fileUploadInput.files.length>0){
        const file = fileUploadInput.files[0];
        fileToDataURL(file).then(data=>{
          filesMap[sec] = filesMap[sec] || [];
          filesMap[sec].push({ name, url: data, type: file.type || (typeSel==="image"?"image":"file") });
          persistFiles(filesMap); updateSectionFilesList(sec); fileNameInput.value=""; fileUrlInput.value=""; fileUploadInput.value="";
          if(main?.dataset.currentSection===sec) openSection(sec);
        }).catch(()=> alert("فشل رفع الملف"));
        return;
      }
      const url = (fileUrlInput?.value||"").trim();
      if(!url){ alert("أدخل رابطاً أو ارفع ملفاً"); return; }
      filesMap[sec] = filesMap[sec] || [];
      filesMap[sec].push({ name, url, type: (typeSel==="image"?"image":"file") });
      persistFiles(filesMap); updateSectionFilesList(sec); fileNameInput.value=""; fileUrlInput.value=""; fileUploadInput.value="";
      if(main?.dataset.currentSection===sec) openSection(sec);
    });
    clearUploads?.addEventListener("click", ()=>{ if(fileNameInput) fileNameInput.value=""; if(fileUrlInput) fileUrlInput.value=""; if(fileUploadInput) fileUploadInput.value=""; });

    // update files list in admin (and fileEditSelect)
    function updateSectionFilesList(section){
      if(!sectionFilesList) return;
      sectionFilesList.innerHTML = "";
      if(!section || !filesMap[section]) return;
      filesMap[section].forEach((f, idx)=>{
        const row = document.createElement("div"); row.className="file-row";
        const left = document.createElement("div"); left.textContent = `${f.name} (${f.type})`;
        const right = document.createElement("div");
        const editBtn = document.createElement("button"); editBtn.className="btn"; editBtn.textContent="✏️";
        editBtn.onclick = ()=> {
          const nn = prompt("اسم جديد:", f.name);
          if(nn){ f.name = nn; persistFiles(filesMap); updateSectionFilesList(section); populateFileEditSelect(section); if(main && main.dataset.currentSection===section) openSection(section); }
        };
        const delBtn = document.createElement("button"); delBtn.className="btn danger"; delBtn.textContent="🗑";
        delBtn.onclick = ()=> {
          if(confirm("حذف الملف؟")){ filesMap[section].splice(idx,1); persistFiles(filesMap); updateSectionFilesList(section); populateFileEditSelect(section); if(main && main.dataset.currentSection===section) openSection(section); }
        };
        right.append(editBtn, delBtn); row.append(left, right); sectionFilesList.appendChild(row);
      });
    }

    // populate file edit select based on selected section
    function populateFileEditSelect(section){
      if(!fileEditSelect) return;
      fileEditSelect.innerHTML = "";
      fileEditSelect.appendChild(new Option("",""));
      const files = (section && filesMap[section]) ? filesMap[section] : [];
      files.forEach((f, idx) => {
        const opt = new Option(f.name, String(idx));
        fileEditSelect.appendChild(opt);
      });
      updateSectionFilesList(section);
    }

    // when filter section changes, populate file select
    fileSectionFilter?.addEventListener("change", ()=>{
      const sec = fileSectionFilter.value;
      populateFileEditSelect(sec);
    });

    // when a specific file is chosen, show details below for quick rename/delete
    fileEditSelect?.addEventListener("change", ()=>{
      const sec = fileSectionFilter?.value;
      const idx = fileEditSelect?.value;
      // clear area
      if(sectionFilesList) sectionFilesList.innerHTML = "";
      if(!sec || idx === "" || !filesMap[sec] || !filesMap[sec][Number(idx)]) return;
      const f = filesMap[sec][Number(idx)];
      // build a small editor UI
      const wrapper = document.createElement("div");
      wrapper.style.display = "flex";
      wrapper.style.flexDirection = "column";
      wrapper.style.gap = "8px";

      const nameInput = document.createElement("input");
      nameInput.value = f.name;
      nameInput.style.padding = "8px";
      nameInput.style.borderRadius = "8px";
      nameInput.style.border = "1px solid #ddd";

      const urlInput = document.createElement("input");
      urlInput.value = f.url || "";
      urlInput.style.padding = "8px";
      urlInput.style.borderRadius = "8px";
      urlInput.style.border = "1px solid #ddd";

      const saveBtn = document.createElement("button");
      saveBtn.className = "btn primary";
      saveBtn.textContent = "حفظ التعديلات";

      const removeBtn = document.createElement("button");
      removeBtn.className = "btn danger";
      removeBtn.textContent = "حذف الملف";

      saveBtn.onclick = () => {
        const newName = (nameInput.value||"").trim(); const newUrl = (urlInput.value||"").trim();
        if(!newName) return alert("ادخل اسم");
        f.name = newName; f.url = newUrl || f.url;
        persistFiles(filesMap); populateFileEditSelect(sec); updateSectionFilesList(sec); if(main && main.dataset.currentSection===sec) openSection(sec);
        alert("✅ تم حفظ التعديلات");
      };
      removeBtn.onclick = () => {
        if(confirm("هل تريد حذف هذا الملف؟")){
          filesMap[sec].splice(Number(idx), 1);
          persistFiles(filesMap); populateFileEditSelect(sec); updateSectionFilesList(sec); if(main && main.dataset.currentSection===sec) openSection(sec);
        }
      };

      wrapper.appendChild(nameInput);
      wrapper.appendChild(urlInput);
      wrapper.appendChild(saveBtn);
      wrapper.appendChild(removeBtn);

      sectionFilesList.appendChild(wrapper);
    });

    // search (عرض نتائج شبكية)
    searchInput?.addEventListener("input", ()=>{
      const q = (searchInput.value||"").toLowerCase().trim();
      if(!main) return;
      if(!q){ main.innerHTML = `<p class="placeholder">اختر قسماً من القائمة أو أضف جديداً من لوحة التحكم ✨</p>`; return; }
      const results = [];
      Object.keys(filesMap).forEach(sec=>{
        if(sec.toLowerCase().includes(q)) results.push({ name: sec, type: "section" });
        (filesMap[sec]||[]).forEach(f=>{
          if((f.name||"").toLowerCase().includes(q) || (f.url||"").toLowerCase().includes(q)){
            results.push(Object.assign({}, f, { section: sec }));
          }
        });
      });
      if(results.length===0){ main.innerHTML = `<p class="placeholder">❌ لا توجد نتائج</p>`; return; }
      const grid = document.createElement("div"); grid.className = "grid";
      results.forEach(item=>{
        const c = document.createElement("div"); c.className = "card";
        if(item.type === "section"){ c.innerHTML = `<p>📁 ${item.name}</p>`; c.addEventListener("click", ()=>{ openSection(item.name); sidebar?.setAttribute("aria-hidden","true"); manageSidebarOverlay(false); }); }
        else if(item.type && item.type.startsWith && item.type.startsWith("image")){ c.innerHTML = `<img src="${item.url}" alt="${item.name}"><p>${item.name}</p><small>${item.section||""}</small>`; c.addEventListener("click", ()=>openViewer(item)); }
        else { c.innerHTML = `<p>📄 ${item.name}</p><small>${item.section||""}</small>`; c.addEventListener("click", ()=>openViewer(item)); }
        grid.appendChild(c);
      });
      main.innerHTML = ""; main.appendChild(grid);
    });

    // colors & themes
    saveColors?.addEventListener("click", ()=>{
      const obj = { header: headerColor.value, text: textColor.value, bg: bgColor.value };
      persistColors(obj); applyColors(obj); alert("✅ تم حفظ الألوان");
    });
    themeSelect?.addEventListener("change", ()=>{
      const v = themeSelect.value;
      if(!v){ themePreview.textContent = "معاينة"; themePreview.style.background=""; themePreview.style.color = ""; return; }
      const map = { dark:{bg:"#111",color:"#eee"}, light:{bg:"#fff",color:"#111"}, blue:{bg:"#e8f4ff",color:"#072b61"}, green:{bg:"#eaf6ea",color:"#0b4d2e"}, purple:{bg:"#f5e9ff",color:"#3b0f5a"} };
      const p = map[v]; themePreview.textContent = v; themePreview.style.background = p.bg; themePreview.style.color = p.color;
    });
    saveTheme?.addEventListener("click", ()=>{
      const v = themeSelect.value; if(!v) return alert("اختر ستايل");
      persistTheme(v); document.body.setAttribute("data-theme", v); alert("✅ تم حفظ الستايل");
    });

    // background image handlers
    saveBgImage?.addEventListener("click", ()=>{
      const url = (bgImageUrl?.value||"").trim();
      if(url){ persistBgImage(url); applyBgImage(url); alert("✅ تم حفظ الخلفية من الرابط"); return; }
      if(bgImageUpload && bgImageUpload.files && bgImageUpload.files.length>0){
        const f = bgImageUpload.files[0];
        fileToDataURL(f).then(data=>{
          persistBgImage(data); applyBgImage(data); alert("✅ تم حفظ الخلفية من الملف"); bgImageUpload.value=""; if(bgImageUrl) bgImageUrl.value="";
        }).catch(()=> alert("فشل قراءة الملف"));
        return;
      }
      alert("اختر صورة أو ضع رابطاً");
    });
    clearBgImage?.addEventListener("click", ()=>{ persistBgImage(null); applyBgImage(null); alert("✅ تمت إزالة الخلفية"); });

    // change owner password
    changePassBtn?.addEventListener("click", ()=>{
      const oldP = (changeOldPass?.value||"").trim();
      const newP = (changeNewPass?.value||"").trim();
      const conf = (changeConfirmPass?.value||"").trim();
      if(!oldP || !newP || !conf) return alert("املأ جميع الحقول");
      if(oldP !== getMaster()) return alert("كلمة المرور الحالية غير صحيحة");
      if(newP.length < 4) return alert("يجب أن تكون كلمة المرور الجديدة 4 أحرف على الأقل");
      if(newP !== conf) return alert("تأكيد كلمة المرور لا يطابق");
      localStorage.setItem(LS_PASSWORD, newP);
      if(changePassMsg) { changePassMsg.style.color = "green"; changePassMsg.textContent = "✅ تم تغيير كلمة المرور بنجاح"; }
      if(changeOldPass) changeOldPass.value=""; if(changeNewPass) changeNewPass.value=""; if(changeConfirmPass) changeConfirmPass.value="";
      setTimeout(()=> { if(changePassMsg) changePassMsg.textContent = ""; }, 3000);
    });

    // helper: preload admin inputs
    function loadAdminValues(){
      try {
        const c = JSON.parse(localStorage.getItem(LS_COLORS)||"null");
        if(c){ headerColor && (headerColor.value = c.header || "#6a11cb"); textColor && (textColor.value = c.text || "#222"); bgColor && (bgColor.value = c.bg || "#f9f9fb"); }
      } catch(e){}
      const bg = localStorage.getItem(LS_BG_IMAGE);
      if(bg) { if(bgImageUrl) bgImageUrl.value = ""; } else { if(bgImageUrl) bgImageUrl.value = ""; }
    }

    // init (render)
    function init(){
      renderSectionsList();
      loadColors(); loadTheme(); loadBgImage();
      if(Object.keys(filesMap).length>0){
        const first = Object.keys(filesMap)[0];
        openSection(first);
      }
    }
    init();

    // set safe defaults
    if(!localStorage.getItem(LS_FILES)) persistFiles(filesMap);
    if(!localStorage.getItem(LS_PASSWORD)) localStorage.setItem(LS_PASSWORD, DEFAULT_MASTER);

  }); // DOMContentLoaded
})(); // IIFE