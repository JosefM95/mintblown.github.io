/* Browser-local project data; no server, accounts, or network requests. */
(function () {
  'use strict';
  const KEY = 'mission-mausefallenauto-v1';
  const storageAllowed=window.TrapConsent?.persistent===true;
  let state = { tables: {}, controls: {}, explored: {}, profile: {}, notes: {}, hypotheses: {} }, persistent = storageAllowed, stale = false;
  if(storageAllowed)try {
    const stored = JSON.parse(localStorage.getItem(KEY));
    if (stored && typeof stored === 'object') {
      for (const part of ['tables', 'controls', 'explored']) {
        if (stored[part] && typeof stored[part] === 'object' && !Array.isArray(stored[part])) state[part] = stored[part];
      }
      if(stored.profile&&typeof stored.profile==='object'&&!Array.isArray(stored.profile)){
        for(const [key,max] of [['name',150],['groupName',150],['members',1000]])if(typeof stored.profile[key]==='string')state.profile[key]=stored.profile[key].slice(0,max);
      }
      if(stored.hypotheses&&typeof stored.hypotheses==='object'&&!Array.isArray(stored.hypotheses)){
        for(const id of ['federkraft','hebel','goldene-regel','uebersetzung','raeder']){
          if(typeof stored.hypotheses[id]==='string')state.hypotheses[id]=stored.hypotheses[id].slice(0,10000);
        }
      }
      if(stored.notes&&typeof stored.notes==='object'&&!Array.isArray(stored.notes)){
        for(const id of ['federkraft','hebel','goldene-regel','uebersetzung','raeder','reibung','rechnen','testgelaende']){
          if(typeof stored.notes[id]==='string')state.notes[id]=stored.notes[id].slice(0,10000);
        }
      }
    }
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch (_) { persistent = false; }
  function status() {
    const target = document.getElementById('storage-status');
    if (target) target.textContent = !storageAllowed
      ? 'Nur auf dieser geöffneten Seite: Beim Wechseln, Neuladen oder Schließen geht dieser Stand verloren. Vorher Screenshots oder eine Projektdatei sichern. Vorhandene Speicherstände bleiben unangetastet.'
      : persistent
      ? 'Automatisch auf diesem Gerät in diesem Browser gespeichert. Diagramme zusätzlich per Screenshot sichern; bei Browserdaten-Löschung gehen lokale Daten verloren.'
      : 'Der Browser kann die Daten gerade nicht dauerhaft speichern. Sichert eure Diagramme per Screenshot und eure Versuchsreihe als CSV, bevor ihr diese Seite verlasst.';
  }
  function save() {
    if (stale) return;
    if(!storageAllowed){status();return;}
    try { localStorage.setItem(KEY, JSON.stringify(state)); }
    catch (_) { persistent = false; }
    status();
  }
  const format = (value, digits = 2) => Number.isFinite(value)
    ? value.toLocaleString('de-DE', { maximumFractionDigits: digits }) : '—';
  const escape = value => String(value ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  function localDate() { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`; }
  document.getElementById('reset-data')?.addEventListener('click', () => {
    if (!confirm(storageAllowed?'Alle gespeicherten Projektdaten in diesem Browser zurücksetzen? Screenshots und exportierte Dateien bleiben erhalten.':'Die Daten dieser geöffneten Seite verwerfen? Bereits gespeicherte Projektstände bleiben unangetastet.')) return;
    state.tables = {}; state.controls = {}; state.explored = {}; state.profile = {}; state.notes = {}; state.hypotheses = {}; save(); location.reload();
  });
  // Another tab can save newer project data. Reload deliberately instead of overwriting it silently.
  addEventListener('storage', event => {
    if (!storageAllowed||event.key !== KEY) return;
    stale = true;
    document.querySelectorAll('input, select, textarea, button').forEach(element => { element.disabled = true; });
    const target = document.getElementById('storage-status');
    if (target) {
      target.replaceChildren(document.createTextNode('Projektdaten wurden in einem anderen Tab geändert. '));
      const button = document.createElement('button'); button.type = 'button'; button.className = 'button small secondary';
      button.textContent = 'Aktuellen Stand laden'; button.onclick = () => location.reload(); target.append(button);
    }
  });
  window.Trap = { state, save, format, escape, localDate,storageAllowed };
  const footer=document.querySelector('.site-footer');
  if(footer){
    const button=document.createElement('button');button.type='button';button.className='button small secondary';button.id='withdraw-project-consent';
    button.textContent=storageAllowed?'Einwilligung widerrufen und Daten löschen':'Einwilligung widerrufen und Sitzung beenden';
    const dialog=document.createElement('dialog');dialog.id='withdraw-consent-dialog';dialog.className='withdraw-consent-dialog';
    dialog.setAttribute('aria-labelledby','withdraw-consent-title');dialog.setAttribute('aria-describedby','withdraw-consent-description');
    dialog.innerHTML='<h2 id="withdraw-consent-title">Achtung: Eure Projektdaten werden gelöscht!</h2><p id="withdraw-consent-description"></p><p>Das lässt sich nicht rückgängig machen. Bereits exportierte Dateien und Screenshots bleiben erhalten.</p><form><label for="withdraw-consent-code">Gebt zur Bestätigung diese sechsstellige Zahlenkombination ein: <strong id="withdraw-consent-challenge"></strong></label><input id="withdraw-consent-code" type="text" inputmode="numeric" pattern="[0-9]{6}" minlength="6" maxlength="6" autocomplete="off" required><div class="actions"><button class="button secondary" type="button" id="withdraw-consent-cancel" autofocus>Abbrechen</button><button class="button" type="submit" id="withdraw-consent-confirm" disabled>Einwilligung widerrufen und Daten löschen</button></div></form>';
    document.body.append(dialog);
    const codeInput=dialog.querySelector('input'),confirmButton=dialog.querySelector('[type="submit"]');
    let challenge='';
    dialog.querySelector('#withdraw-consent-description').textContent=storageAllowed
      ?'Wenn ihr jetzt bestätigt, werden alle gespeicherten Projektdaten dieses Projekts in diesem Browser gelöscht und eure Einwilligung zurückgezogen.'
      :'Wenn ihr jetzt bestätigt, werden alle Projektdaten dieser geöffneten Seite verworfen und eure Einwilligung zurückgezogen. Ältere, bereits gespeicherte Projektstände bleiben erhalten.';
    dialog.querySelector('#withdraw-consent-cancel').onclick=()=>dialog.close();
    codeInput.addEventListener('input',()=>{confirmButton.disabled=codeInput.value!==challenge;});
    button.onclick=()=>{
      challenge=String(100000+Math.floor(Math.random()*900000));
      dialog.querySelector('#withdraw-consent-challenge').textContent=challenge;
      codeInput.value='';confirmButton.disabled=true;dialog.showModal();
    };
    dialog.querySelector('form').addEventListener('submit',event=>{
      event.preventDefault();
      if(codeInput.value!==challenge)return;
      if(window.TrapConsent?.forget?.()===false){alert('Die gemerkte Einwilligung konnte nicht entfernt werden. Schließt diesen Tab, um die Tabsitzung zu beenden.');return;}
      if(storageAllowed)try{localStorage.removeItem(KEY);}catch(_){alert('Die gespeicherten Daten konnten nicht gelöscht werden. Entfernt die Website-Daten bei Bedarf über eure Browsereinstellungen.');}
      location.reload();
    });
    footer.append(button);
  }
  status();
})();
