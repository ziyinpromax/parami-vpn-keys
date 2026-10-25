/* Parami VPN Keys - pure generator functions, no server, no external calls.
   Keys saved only in this browser's localStorage. Nothing is sent anywhere. */
(function () {
  'use strict';
  function newUUID() {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID();
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      var r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }
  function newPass(len) {
    len = len || 16;
    var chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%';
    var out = '';
    if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
      var a = new Uint8Array(len);
      crypto.getRandomValues(a);
      for (var i = 0; i < len; i++) out += chars[a[i] % chars.length];
      return out;
    }
    for (var j = 0; j < len; j++) out += chars[Math.floor(Math.random() * chars.length)];
    return out;
  }
  function b64(str) {
    if (typeof Buffer !== 'undefined') return Buffer.from(str, 'utf8').toString('base64');
    return btoa(unescape(encodeURIComponent(str)));
  }
  function b64url(str) {
    return b64(str).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  }
  function encName(name) { return encodeURIComponent(name || 'Parami'); }

  function vlessLink(o) {
    var q = 'security=' + encodeURIComponent(o.security || 'tls')
      + '&type=' + encodeURIComponent(o.network || 'ws')
      + '&host=' + encodeURIComponent(o.host || o.server)
      + '&path=' + encodeURIComponent(o.path || '/')
      + '&sni=' + encodeURIComponent(o.sni || o.server);
    if (o.network === 'ws') q += '&encryption=none';
    return 'vless://' + o.uuid + '@' + o.server + ':' + o.port + '?' + q + '#' + encName(o.name);
  }
  function vmessLink(o) {
    var obj = {
      v: '2', ps: o.name || 'Parami', add: o.server, port: String(o.port),
      id: o.uuid, aid: '0', scy: o.scy || 'auto', net: o.network || 'ws',
      type: 'none', host: o.host || o.server, path: o.path || '/',
      tls: (o.security === 'tls' ? 'tls' : ''), sni: o.sni || o.server
    };
    return 'vmess://' + b64(JSON.stringify(obj));
  }
  function trojanLink(o) {
    var q = 'security=tls&type=' + encodeURIComponent(o.network || 'tcp')
      + '&sni=' + encodeURIComponent(o.sni || o.server);
    if (o.network === 'ws') q += '&host=' + encodeURIComponent(o.host || o.server) + '&path=' + encodeURIComponent(o.path || '/');
    return 'trojan://' + encodeURIComponent(o.password) + '@' + o.server + ':' + o.port + '?' + q + '#' + encName(o.name);
  }
  function ssLink(o, outline) {
    var userinfo = b64(o.method + ':' + o.password);
    var url = 'ss://' + userinfo + '@' + o.server + ':' + o.port;
    if (outline) url += '/?outline=1';
    return url + '#' + encName(o.name);
  }
  function sshText(o) {
    return 'SSH Server\n'
      + 'Host: ' + o.server + '\nPort: ' + o.port + '\nUsername: ' + o.user + '\nPassword: ' + o.password + '\n'
      + (o.proxyHost ? 'Proxy Host: ' + o.proxyHost + '\nProxy Port: ' + (o.proxyPort || '') + '\n' : '')
      + (o.sni ? 'SNI: ' + o.sni + '\n' : '')
      + 'Note: Flâsh VPN ထဲမှာ SSH form မှာ ဒီအတိုင်း ဖြည့်ပါ။';
  }
  function buildLink(proto, o) {
    if (proto === 'vless') return vlessLink(o);
    if (proto === 'vmess') return vmessLink(o);
    if (proto === 'trojan') return trojanLink(o);
    if (proto === 'ss') return ssLink(o, false);
    if (proto === 'outline') return ssLink(o, true);
    if (proto === 'ssh') return sshText(o);
    throw new Error('unknown protocol: ' + proto);
  }
  function buildSubscription(links) {
    return b64(links.filter(Boolean).join('\n'));
  }

  var api = { newUUID: newUUID, newPass: newPass, b64: b64, buildLink: buildLink, buildSubscription: buildSubscription, vlessLink: vlessLink, vmessLink: vmessLink, trojanLink: trojanLink, ssLink: ssLink, sshText: sshText };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  if (typeof window !== 'undefined') window.ParamiKeys = api;

  if (typeof document === 'undefined') return;
  document.addEventListener('DOMContentLoaded', function () {
    var $ = function (id) { return document.getElementById(id); };
    var protoEl = $('proto'), outEl = $('output'), warnEl = $('warn');
    // Remember Server/Port/Method in THIS browser only (localStorage).
    // Deliberately NOT hardcoded in the public site: the site is public,
    // so hardcoding his Railway proxy here would show it to every visitor
    // and could burn his trial credit. This browser remembers it instead.
    function loadSavedServer() {
      try { return JSON.parse(localStorage.getItem('paramiServer') || 'null'); } catch (e) { return null; }
    }
    function saveServer() {
      try {
        localStorage.setItem('paramiServer', JSON.stringify({
          server: $('server').value.trim(), port: $('port').value.trim(), method: $('method').value
        }));
      } catch (e) {}
    }
    (function restoreServer() {
      var s = loadSavedServer();
      if (s && s.server) {
        $('server').value = s.server;
        if (s.port) $('port').value = s.port;
        if (s.method) $('method').value = s.method;
      }
    })();
    function showFields() {
      var p = protoEl.value;
      ['f-vless', 'f-vmess', 'f-trojan', 'f-ss', 'f-ssh'].forEach(function (id) {
        $(id).style.display = 'none';
      });
      // UUID / security / network live in f-vless, password lives in f-ss.
      // VMess and Trojan reuse those same inputs, SSH reuses the password input.
      if (p === 'vless' || p === 'vmess' || p === 'trojan') $('f-vless').style.display = 'block';
      if (p === 'vmess') $('f-vmess').style.display = 'block';
      if (p === 'trojan') { $('f-trojan').style.display = 'block'; $('f-ss').style.display = 'block'; }
      if (p === 'ss' || p === 'outline') $('f-ss').style.display = 'block';
      if (p === 'ssh') { $('f-ssh').style.display = 'block'; $('f-ss').style.display = 'block'; }
      $('serverLabel').textContent = (p === 'ssh') ? 'SSH Host' : 'Server (domain / IP)';
    }
    function collect() {
      return {
        name: $('name').value.trim() || 'Parami',
        server: $('server').value.trim(),
        port: $('port').value.trim() || '443',
        uuid: $('uuid').value.trim(),
        password: $('password').value.trim(),
        method: $('method').value,
        security: $('security').value,
        network: $('network').value,
        host: $('host').value.trim(),
        path: $('path').value.trim() || '/',
        sni: $('sni').value.trim(),
        scy: $('scy').value,
        user: $('sshUser').value.trim(),
        proxyHost: $('proxyHost').value.trim(),
        proxyPort: $('proxyPort').value.trim()
      };
    }
    function render() {
      var o = collect(), p = protoEl.value, warn = '';
      if (!o.server) { outEl.value = ''; warnEl.textContent = 'Server ထည့်ဦး။ Server မရှိရင် key က ချိတ်လို့မရဘူး။'; return; }
      if (p === 'vless' && o.security === 'none') warn = '⚠️ သတိ: VLESS security=none ကို public server မှာ Flâsh ရဲ့ Xray core က ငြင်းတယ်။ TLS သုံးပါ။';
      if (p === 'ss' || p === 'outline') {
        if (!o.password) { warnEl.textContent = 'SS password ထည့်ဦး။'; return; }
      } else if (p !== 'ssh' && !o.uuid && p !== 'trojan') {
        warnEl.textContent = 'UUID ထည့်ဦး၊ ဒါမှမဟုတ် UUID ထုတ်မယ် နှိပ်ပါ။'; return;
      }
      try { outEl.value = buildLink(p, o); } catch (e) { outEl.value = ''; warn = 'Error: ' + e.message; }
      warnEl.textContent = warn;
    }
    protoEl.addEventListener('change', function () {
      var p = protoEl.value;
      var saved = loadSavedServer();
      // Do not overwrite a remembered port: e.g. his Railway SS port is
      // 21212, not the generic 8388, so a remembered port wins for ss/outline.
      if ((p === 'ss' || p === 'outline') && saved && saved.port) { $('port').value = saved.port; }
      else { $('port').value = (p === 'vless' || p === 'trojan') ? '443' : (p === 'vmess' ? '443' : (p === 'ss' || p === 'outline') ? '8388' : (p === 'ssh' ? '22' : '443')); }
      showFields(); render(); saveServer();
    });
    $('btnUuid').addEventListener('click', function () { $('uuid').value = newUUID(); render(); });
    $('btnPass').addEventListener('click', function () { $('password').value = newPass(16); render(); });
    ['name', 'server', 'port', 'uuid', 'password', 'method', 'security', 'network', 'host', 'path', 'sni', 'scy', 'sshUser', 'proxyHost', 'proxyPort'].forEach(function (id) {
      var el = $(id); if (el) el.addEventListener('input', render);
    });
    ['server', 'port', 'method'].forEach(function (id) {
      var el = $(id); if (el) el.addEventListener('input', saveServer);
      if (el) el.addEventListener('change', saveServer);
    });
    $('btnCopy').addEventListener('click', function () {
      if (!outEl.value) return;
      navigator.clipboard.writeText(outEl.value).then(function () { $('copyMsg').textContent = '✅ Copy ကူးပြီးပြီ — Flâsh VPN → ထည့်ရန် → Link ကူးထည့်မှာ ကပ်ပါ'; });
    });
    function loadKeys() {
      try { return JSON.parse(localStorage.getItem('paramiKeys') || '[]'); } catch (e) { return []; }
    }
    function saveKeys(list) { localStorage.setItem('paramiKeys', JSON.stringify(list)); renderKeys(); }
    function renderKeys() {
      var list = loadKeys(), box = $('myKeys');
      if (!list.length) { box.innerHTML = '<p class="muted">သိမ်းထားတဲ့ key မရှိသေးပါ။ အပေါ်က Key ထုတ်ပြီး သိမ်းမယ် နှိပ်ပါ။</p>'; $('subOut').value = ''; return; }
      box.innerHTML = list.map(function (k, i) {
        return '<div class="keyrow"><b>' + k.name + '</b> <span class="chip">' + k.proto + '</span> <span class="muted">' + (k.expiry || '') + '</span><br><code>' + k.link.replace(/</g, '&lt;') + '</code><br><button class="btn small" data-copy="' + i + '">📋 Copy</button> <button class="btn small danger" data-del="' + i + '">🗑 ဖျက်</button></div>';
      }).join('');
      box.querySelectorAll('[data-copy]').forEach(function (b) { b.addEventListener('click', function () { navigator.clipboard.writeText(list[+b.dataset.copy].link); }); });
      box.querySelectorAll('[data-del]').forEach(function (b) { b.addEventListener('click', function () { var l = loadKeys(); l.splice(+b.dataset.del, 1); saveKeys(l); }); });
      $('subOut').value = buildSubscription(list.map(function (k) { return k.link; }).filter(function (l) { return l.indexOf('://') > 0; }));
    }
    $('btnSave').addEventListener('click', function () {
      if (!outEl.value) return;
      var list = loadKeys();
      list.push({ name: collect().name, proto: protoEl.value, link: outEl.value, expiry: $('expiry').value || '' });
      saveKeys(list);
      $('saveMsg').textContent = '✅ သိမ်းပြီးပြီ။ ဒီ browser ထဲမှာပဲ သိမ်းပါတယ်။';
    });
    $('btnSubCopy').addEventListener('click', function () { if ($('subOut').value) navigator.clipboard.writeText($('subOut').value); });
    // SSHOcean-style quick VLESS creator: Name + Host/SNI only, rest auto.
    // Auto: fresh UUID per Create, WS + TLS, Path /, Host = SNI.
    // Port defaults to 443 but is editable (443 does not work on every server).
    // Server defaults to Host when the optional Server field is blank.
    var quickUuid = '';
    function buildQuick() {
      var name = $('q-name').value.trim() || 'Parami';
      var hostIn = $('q-host').value.trim();
      var serverIn = $('q-server').value.trim();
      var server = serverIn || hostIn;
      var host = hostIn || server;
      if (!server) { $('q-output').value = ''; $('q-warn').textContent = 'Host/SNI ထည့်ဦး။'; return null; }
      if (!quickUuid) quickUuid = newUUID();
      var port = $('q-port').value.trim() || '443';
      var link = vlessLink({ uuid: quickUuid, server: server, port: port, security: 'tls', network: 'ws', host: host, path: '/', sni: host, name: name });
      $('q-output').value = link;
      $('q-warn').textContent = 'UUID, WS+TLS, Path / auto ထားတယ်။ Port က ' + port + ' ပါ။ Flâsh → ထည့်ရန် → Link ကူးထည့်မှာ ကပ်ပါ။';
      return link;
    }
    $('btnQuick').addEventListener('click', function () { quickUuid = newUUID(); buildQuick(); });
    $('btnQuickUuid').addEventListener('click', function () { quickUuid = newUUID(); if ($('q-output').value) buildQuick(); });
    $('btnQuickCopy').addEventListener('click', function () {
      if (!$('q-output').value) return;
      navigator.clipboard.writeText($('q-output').value).then(function () { $('q-copyMsg').textContent = '✅ Copy ကူးပြီးပြီ — Flâsh VPN → ထည့်ရန် → Link ကူးထည့်မှာ ကပ်ပါ'; });
    });
    document.querySelectorAll('[data-mode]').forEach(function (b) {
      b.addEventListener('click', function () {
        document.querySelectorAll('[data-mode]').forEach(function (x) { x.classList.remove('active'); });
        b.classList.add('active');
        document.querySelectorAll('.mode').forEach(function (m) { m.style.display = 'none'; });
        document.getElementById('mode-' + b.dataset.mode).style.display = 'block';
      });
    });
    showFields(); render(); renderKeys();
  });
})();
