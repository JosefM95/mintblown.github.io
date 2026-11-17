# Java mit GLOOP · Ballwurfspiel

Start here: `index.html`. This is a standalone project linked directly from
the repository's root `index.html`, not a subproject of `ifef/`.

## Teaching purpose

This self-study unit is designed for students to keep open on a tablet while
they work in BlueJ on a school PC. It guides them from analysing the supplied
prototype through planning, independent implementation, testing, and
well-reasoned extensions. Hints are layered and prompt students to reason
about concepts and conditions; the complete model solution is not published.
The planning sequence now includes creating the missing ground and target
objects before students work on positioning, flight, and hit evaluation.

The unit assumes basic object-oriented programming vocabulary. Its focus is
Java `while` and `if` statements, keyboard input, animation, and using
pre-supplied GLOOP objects.

## BlueJ and supplied materials

Students receive the starter code from the school network drive; it is not
copied into this public project. The local `new/` folder contains the supplied
starter, worksheets, and teacher-only model solutions. Do not copy source code
or solution code from those materials into the public project.

The worksheet question about `while (!tastatur.esc())` refers to an Escape-key
example separate from the space-bar condition in
the supplied `Ballwurfspiel.java` starter. The learning unit makes this
distinction explicit.

The BlueJ screenshots in `img/bluej-*.png` show the constructor call that
creates a `Ballwurfspiel` object and the subsequent `fuehreAus()` call on that
object. Their captions and alternative text describe the visible actions.
`img/ballwurfspiel-skizze.png` is the planning image supplied with the lesson
materials.

Some supplied program variants call `fuehreAus()` manually from the BlueJ
object bench; another starts the method in the constructor. Students should
use only one start mechanism to avoid launching the game twice.

## Files and behavior

- `index.html`: tablet-friendly learning path, BlueJ instructions, prompts,
  differentiated hints, testing ideas, and an exit checklist.
- `referenzen/index.html`: beginner-friendly Java syntax and GLOOP guide,
  source PDFs, corrections to ambiguous rules in the syntax handout, and an
  interactive knowledge quiz.
- `referenzen/quiz.js`: checks five answers and explains each response without
  storing results.
- `styles.css`: responsive layout and additions to the shared site styling.
- `lesson.js`: feedback for two self-checks; it does not execute student code.
- `img/`: BlueJ screenshots and the planning image.
- `referenzen/material/`: copies of the supplied PDFs:
  `Grundlagenuebersicht-GLOOP-3.7.pdf` and
  `Syntaxregeln-Java-V2-original.pdf`.

There is no build step or added dependency. JavaScript is needed for self-check
feedback; the rest of the learning material remains readable without it.
Answers and personal data are not stored or transmitted.

The original Java syntax handout is preserved as supplied. It explicitly
labels itself incomplete and contains wording that can mislead beginners
(including an overgeneralized semicolon rule and an unfinished `if`
definition). The reference page provides corrected explanations rather than
silently altering the source PDF.

## Protecting model solutions

`.gitignore` excludes the entire `new/` input folder to reduce the risk of
publishing classroom materials accidentally. The planning sketch used by the
lesson is copied to `img/ballwurfspiel-skizze.png`. Do not bypass this rule
with `git add -f`. Before a public deployment, check the staged files for
source copies, worksheets, solutions, and compiled classes.

## Review checklist

In a browser:

1. Open the project from the root `index.html` and follow each in-page link.
2. Try each self-check without an answer, with a wrong answer, and with the
   correct answer.
3. Complete the reference quiz with correct, incorrect, and unanswered
   responses.
4. Read the BlueJ instructions and references at a narrow tablet viewport.
5. Compare the instructions with the BlueJ and GLOOP setup used at school.

The website does not run the Java/GLOOP classes. Compilation depends on the
school's BlueJ version and GLOOP library setup.
