'use strict';

document.querySelectorAll('.self-check').forEach(check => {
  const feedback = check.querySelector('[role="status"]');
  check.querySelectorAll('input[type="radio"]').forEach(input => {
    input.addEventListener('change', () => { feedback.textContent = ''; });
  });
  check.querySelector('.check-answer').addEventListener('click', () => {
    const selected = check.querySelector('input[type="radio"]:checked');
    if (!selected) {
      feedback.textContent = 'Wähle zuerst eine Antwort aus.';
      return;
    }
    if (selected.value !== check.dataset.correct) {
      feedback.textContent = 'Noch nicht ganz. Lies die Frage erneut und verfolge die Bedingung im Code.';
      return;
    }
    feedback.textContent = {
      continue: 'Richtig: Ohne Leertaste ist die Abfrage falsch; das ! macht die while-Bedingung wahr.',
      independent: 'Richtig: Jede if-Anweisung wird separat geprüft. Es gibt hier kein else.'
    }[check.dataset.correct];
  });
});
