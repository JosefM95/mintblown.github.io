'use strict';

const explanations = {
  semicolon: 'Richtig: Ein Methodenaufruf ist ein Befehl und endet mit Semikolon. if- und while-Köpfe sowie schließende Blockklammern nicht.',
  'not-space': 'Richtig: ! kehrt den Wahrheitswert um. Die Abfrage ist wahr, wenn die Leertaste nicht gedrückt ist.',
  'new-object': 'Richtig: new ruft den Konstruktor auf. Bei GLKugel folgen auf den Mittelpunkt (x, y, z) der Radius.',
  'two-ifs': 'Richtig: Jede if-Anweisung prüft ihre Bedingung unabhängig. Ohne else können beide Blöcke laufen.',
  relative: 'Richtig: verschiebe verändert die aktuelle Position relativ. Der erste Wert ist die Änderung auf der X-Achse.'
};

const quiz = document.querySelector('#reference-quiz');
const result = document.querySelector('#quiz-result');

quiz.addEventListener('submit', event => {
  event.preventDefault();
  let score = 0;
  let answered = 0;

  quiz.querySelectorAll('fieldset').forEach(fieldset => {
    const selected = fieldset.querySelector('input:checked');
    const feedback = fieldset.querySelector('.quiz-feedback');
    if (!selected) {
      feedback.textContent = 'Noch nicht beantwortet. Wähle eine Antwort und prüfe sie erneut.';
      return;
    }

    answered += 1;
    if (selected.value === fieldset.dataset.answer) {
      score += 1;
      feedback.textContent = explanations[selected.value];
    } else {
      const correct = fieldset.querySelector(`input[value="${fieldset.dataset.answer}"]`).parentElement.textContent.trim();
      feedback.textContent = `Noch nicht ganz. Richtig ist: ${correct} ${explanations[fieldset.dataset.answer]}`;
    }
  });

  result.textContent = answered === 5
    ? `Ergebnis: ${score} von 5 richtig. ${score === 5 ? 'Sehr gut – du kannst die Referenzen jetzt beim Programmieren anwenden.' : 'Nutze die Erklärungen und schlage die unsicheren Begriffe oben noch einmal nach.'}`
    : `${answered} von 5 beantwortet. Lies die Rückmeldungen und prüfe die offenen Fragen noch einmal.`;
});

quiz.addEventListener('reset', () => {
  quiz.querySelectorAll('.quiz-feedback').forEach(feedback => { feedback.textContent = ''; });
  result.textContent = '';
});
