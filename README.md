# Calculator

A scientific calculator built with Nuxt 4, Vue 3 and Tailwind 4.
Supports `+ - × ÷`, powers, square roots, nth roots, an `Ans` memory,
a movable cursor, and a history list that survives a page refresh.

## Running it

```bash
pnpm install
pnpm dev              # http://localhost:3000
pnpm dev --host       # also reachable from your phone on the same Wi-Fi
pnpm build            # production build
```

## Folder structure

```
app/
├── pages/index.vue              holds the state, wires the pieces together
├── components/calculator/
│   ├── Screen.vue               the lime display          (props only)
│   ├── CursorPad.vue            the arrow cross           (emits only)
│   ├── Keypad.vue               the button grid           (emits only)
│   └── History.vue              the drop-down             (props + emits)
├── composables/
│   ├── useCalculator.ts         state + what each button does
│   └── useLocalStorage.ts       keeping a ref in localStorage
└── utils/                       pure functions — nothing Vue in here
    ├── types.ts                 shared shapes and constants
    ├── math.ts                  one piece of arithmetic at a time
    ├── input.ts                 is this key press allowed?
    ├── parser.ts                text  ->  number
    ├── display.ts               text  ->  drawable runs
    └── history.ts               the saved list of finished sums
```

The split is by **what a function needs to know**, not by size. `math.ts`
never sees your typed text; `input.ts` only looks at what you have typed so
far; `parser.ts` and `display.ts` read the same text but answer two different
questions ("what does this equal" vs "what should this look like").

## How the pieces talk

```
                 useCalculator()      <- ALL state lives here, called ONCE
                        |
        index.vue ------+---------------------
         |              |         |          |
     props|  ^emits     |         |          |
          v  |          v         v          v
       Screen        CursorPad  Keypad    History
```

- **Down = props.** Values a component displays. It may read them, never assign to them.
- **Up = emits.** "A button was pressed." The component reports it and `index.vue` decides what it means.

`Keypad.vue` has no idea what `÷` does — it fires `$emit('operator', '÷')` and
stops. All the thinking stays in one file, so when something misbehaves there
is only one place to look.

> **Do not** call `useCalculator()` inside a child component. A composable
> creates fresh state every time it is called, so you would end up with several
> separate calculators that never see each other's numbers.

## How the maths works

`parser.ts` uses four functions that call each other in a fixed chain. That
chain *is* the order of operations — no priority numbers, no sorting:

```
readExpr     + -        weakest, splits the line last
readTerm     × ÷            |
readPower    ^ ⁿ            |
readUnary    -5  √9  Ans    strongest, sticks to one value
```

Each function asks the one **below** it for its values, so stronger operators
are always finished first. In `2+3×4`, `readTerm` handles the `×` and hands
back `12` before `readExpr` ever gets to add.

One detail worth knowing: `readTerm` uses a `while` loop, which works **left to
right** (`8-3-2` is `(8-3)-2`). `readPower` uses an `if` that calls *itself*,
which works **right to left** (`2^3^2` is `2^(3^2)` = 512). That one-word
difference is the whole reason exponents behave correctly.

## Things that look like mistakes but aren't

**1. Auto-imports mean a name may only exist in one file.**
Nuxt makes everything in `app/utils/` and `app/components/` available without
an import line. If two files export the same name, Nuxt silently picks one and
you cannot tell which — so never keep a "just in case" copy of a function.
Packages from `node_modules` are *not* auto-imported, which is why
`History.vue` has real `import` lines for Headless UI and Heroicons.

**2. `CURSOR` is an invisible character.**
It is `\u0001`, a control character with no shape, slipped into the text so the
cursor travels inside whichever run it lands in and comes out at the right size
even inside an exponent. In the source always write the `\u0001` escape, never
paste the real character — `grep` cannot show it to you, only `od -c` can.

**3. The dangling `>` in `Screen.vue`.**
Tags are deliberately jammed together with the closing `>` parked on the next
line. A newline between two tags becomes a real space on screen, which would
render `12` as `1 2`. It is ugly and it is correct — do not tidy it.

## Note on Pinia

`pinia` and `@pinia/nuxt` are installed and the module is registered in
`nuxt.config.ts`, but nothing uses them yet — the calculator's state lives in
the `useCalculator()` composable. They are kept deliberately for a store to be
added later.
