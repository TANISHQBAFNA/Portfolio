/**
 * projectData - single source of truth for the project rail and detail view.
 * ---------------------------------------------------------------------------
 * Edit / reorder / add entries here. The rail, the counter, the keyboard
 * navigation and the detail panel all derive from this array.
 *
 * index    zero-padded string shown on the folder tab ("01")
 * title    project name, rendered in the display serif
 * category product / discipline label shown above the title
 * blurb    ONE line on the folder. Keep it under ~90 characters.
 * detail   2-4 sentences shown on the opening slide of the project deck.
 * slides   the presentation deck for this project. Each slide is
 *            { title, headline, body, images?, type? }
 *          Board placement is computed in project-detail.js (wander path).
 *          `type` is optional and changes what KIND of slide it is:
 *            'full'      - one big picture; only bites on a one-image slide
 *            'statement' - no pictures at all, claim at title size, a section beat
 *          Leave it off for the default two-column grid.
 *          `body` is the slide's paragraph - plain language, ~45 words, which
 *          sets four lines and fills the band the layout reserves for it. Wrap a
 *          word or phrase in *asterisks* to give it the accent italics the hero
 *          heading uses; it works in `headline` too. Keep it to the words that
 *          carry the sentence, one or two a slide.
 *          A `points` array is still rendered when a slide genuinely is a list,
 *          but `body` wins if both are present.
 *          `images` takes plain paths or { src, alt, caption } objects. TWO is
 *          the maximum per slide - more and none of them is readable. A pair is
 *          laid out as a simple two-column grid: same size, sitting level, every
 *          slide the same. Every
 *          slide is arranged the same way - claim and paragraph across the top,
 *          imagery in the row beneath - so a slide has no layout to choose.
 *          With no images the words simply take the whole panel.
 *          >>> Every slide below is DUMMY CONTENT - copy and imagery both. The
 *          decks are structured like real case studies (context → problem →
 *          research → design → outcome) so the layout can be judged at real
 *          length, but no claim in them is yours until you write it. Square
 *          brackets mark where a specific number or result belongs. <<<
 * year     free text ("2025 - Present", "2022 - 2024", "Ongoing")
 * role     shown on hover and in the detail view
 * scope    shown on hover and in the detail view
 * href     "#" = no case study page yet. Point at a real page when one exists.
 * cover    16:11-ish image. SVG placeholders ship in assets/img/covers/.
 * coverTag short caption printed over the cover
 * status   "live" (href goes somewhere) | "placeholder" (no page yet)
 * tools    what you built it with - rendered on a slip of paper clipped to the
 *          folder. Two to four reads best; leave the field off for no slip.
 * tone     card stock: 'coral' | 'mint' | 'butter' | 'lavender' | 'sky'
 *          (landing assigns these in order). Legacy manila/sage/kraft/slate still paint.
 * attach   how the tools are attached: 'clip' (default) | 'note' for a sticky
 *          note instead. One note in a row of clips is the point; more is noise.
 */
window.PORTFOLIO_PROJECTS = [
  {
    index: '01',
    title: 'SME Banking',
    studyTemplate: 'cbx300',
    tone: 'manila',
    tools: ['Figma', 'Design tokens', 'Storybook'],
    category: 'Fintech Product Design',
    hook: 'Banking for a business, not a person.',
    blurb: 'Banking for a business, not a person. CBX300 SME banking across web and mobile.',
    detail: 'Designing CBX300 — SME banking across web and mobile. Lisa Charlie bank is a demo brand, not a live client. 259 web · 377 mobile · ~147 flows.',
    slides: [
      {
        title: "Context",
        headline: "Where this sat, and why it was *worth doing*",
        body: "[Where this sat - company, product, moment. Who asked for it and why. What existed before you started.]",
      },
      {
        title: "The brief",
        headline: "What I was asked for, and the constraint that shaped it",
        body: "[What you were asked to do, in one line. The constraint that shaped it most. What success was supposed to look like.]",
        images: [
          { src: "assets/img/slides/slide-04.svg", alt: "", caption: "The ask, drawn as one diagram" },
          { src: "assets/img/slides/slide-01.svg", alt: "", caption: "The starting point you were handed" }
        ],
      },
      {
        title: "Who it is for",
        type: "full",
        headline: "The people on this product do not want the same things",
        body: "[Who uses this - one line each, two or three of them. What they were doing instead. The one thing they could not do.]",
        images: [
          { src: "assets/img/slides/slide-01.svg", alt: "", caption: "Dashboard, first-run state" }
        ]
      },
      {
        title: "What we heard",
        headline: "What people told us, and the pattern underneath it",
        body: "[What people told you, in their words. The pattern across those conversations. What surprised you.]",
        images: [
          { src: "assets/img/slides/slide-04.svg", alt: "", caption: "What came up most, grouped" },
          { src: "assets/img/slides/slide-01.svg", alt: "", caption: "The screen people complained about" }
        ],
      },
      {
        title: "The core problem",
        type: "statement",
        headline: "One problem sat under most of the complaints",
        body: "[What was broken, in one plain line. Who it hurt and how often. Why the obvious fix would not work.]",
        images: [
          { src: "assets/img/slides/slide-01.svg", alt: "", caption: "Where it broke, marked up" },
          { src: "assets/img/slides/slide-02.svg", alt: "", caption: "The path that failed, drawn as steps" }
        ],
      },
      {
        title: "Mapping the journey",
        headline: "Where the work actually falls apart",
        body: "[The path someone takes, start to finish. Where it used to break. What you changed about it.]",
        images: [
          { src: "assets/img/slides/slide-02.svg", alt: "", caption: "Payment initiation to release" },
          { src: "assets/img/slides/slide-02.svg", alt: "", caption: "Approval escalation path" }
        ],
      },
      {
        title: "Information architecture",
        type: "full",
        headline: "Fewer places to look, in an order that matches the job",
        body: "[How you grouped things, and why. What used to live in the wrong place. The rule you applied.]",
        images: [
          { src: "assets/img/slides/slide-01.svg", alt: "", caption: "Navigation model" }
        ]
      },
      {
        title: "Approvals, end to end",
        headline: "An approval you can follow from request to receipt",
        body: "[The main task, step by step. What you removed to shorten it. What you deliberately kept.]",
        images: [
          { src: "assets/img/slides/slide-01.svg", alt: "", caption: "Approval queue" },
          { src: "assets/img/slides/slide-01.svg", alt: "", caption: "Approval detail" }
        ]
      },
      {
        title: "Payments",
        headline: "Paying someone without leaving the screen you started on",
        body: "[The main task, step by step. What you removed to shorten it. What you deliberately kept.]",
        images: [
          { src: "assets/img/slides/slide-01.svg", alt: "", caption: "Payment summary" },
          { src: "assets/img/slides/slide-02.svg", alt: "", caption: "Validation states" }
        ]
      },
      {
        title: "The design system",
        headline: "One set of parts, so every screen behaves the same way",
        body: "[What is in the system - colour, type, components. The rule that saved you the most time. The gap you know is still there.]",
        images: [
          { src: "assets/img/slides/slide-04.svg", alt: "", caption: "Token architecture" },
          { src: "assets/img/slides/slide-01.svg", alt: "", caption: "Component library" }
        ],
      },
      {
        title: "Accessibility and states",
        type: "full",
        headline: "The empty, loading and error states are the product too",
        body: "[The look, in one line. One choice you made on purpose. What you left out.]",
        images: [
          { src: "assets/img/slides/slide-01.svg", alt: "", caption: "State matrix" }
        ]
      },
      {
        title: "Prototype and testing",
        headline: "We put it in front of people before we built it",
        body: "[Who you tested with, and how many. The top thing they got stuck on. What you changed as a result.]",
        images: [
          { src: "assets/img/slides/slide-03.svg", alt: "", caption: "Someone using it - a still from a session" },
          { src: "assets/img/slides/slide-01.svg", alt: "", caption: "What you changed afterwards" }
        ],
      },
      {
        title: "Outcome",
        headline: "[What shipped, and what changed for the people using it]",
        body: "[What shipped. What changed for the people using it. Add a real number, or say it was not measured.]",
        images: [
          { src: "assets/img/slides/slide-01.svg", alt: "", caption: "Web, released" },
          { src: "assets/img/slides/slide-03.svg", alt: "", caption: "Mobile, released" }
        ],
      },
      {
        title: "What I would do differently",
        headline: "[What I would change if I started again]",
        body: "[The decision you would revisit. What you would do instead. One thing you learned about working with others.]",
        images: [
          { src: "assets/img/slides/slide-01.svg", alt: "", caption: "The thing you would change, marked with the fix" },
          { src: "assets/img/slides/slide-04.svg", alt: "", caption: "What you would do instead" }
        ],
      }
    ],
    year: 'Jan 2026 – present',
    role: 'Lead product designer — design system, end-to-end screens (web + mobile), through developer handoff',
    scope: 'Web + mobile, design system',
    href: '?open=sme',
    cover: 'assets/img/covers/cover-01.svg',
    coverTag: 'CBX300 · 636 screens · Lisa Charlie demo',
    status: 'live'
  },
  {
    index: '02',
    title: 'Plootus.ai',
    tone: 'slate',
    tools: ['Figma', 'Figma Make', 'Design system'],
    category: 'AI Product Design',
    blurb: 'AI agents that call and email, and dashboards for everyone who reads the results.',
    detail: 'A sales platform where AI agents do the calling and emailing, and everyone from the boss to the rep reads the results on a dashboard built for them.',
    slides: [
      {
        title: "The bet",
        headline: "Four people, four different answers, *one set of numbers*",
        body: "A sales team runs *AI agents* that call and email prospects. The boss, the manager and the rep all read the same numbers, and each of them needs a *different answer* out of them - while someone non-technical has to set the agents up safely. I designed the dashboards, the setup and the rules that hold it together.",
      },
      {
        title: "Project",
        headline: "Five parts of the product, four dashboards, one design system",
        body: "Role - [add your title]. Team and timeline - [add]. Status - [pick one: shipped, pilot, prototype, self-initiated]. Five parts of the product, four dashboards, one design system. Every number shown here is *sample data*, not a result.",
        images: [
          { src: "assets/img/slides/slide-01.svg", alt: "", caption: "The main dashboard, full width - what the product actually is" },
          { src: "assets/img/slides/slide-03.svg", alt: "", caption: "Contact sheet - every screen that shipped, as thumbnails" }
        ],
      },
      {
        title: "The product",
        headline: "AI agents do the outreach; everyone reads the results",
        body: "Agents call, email and message a list of prospects, and *every run is recorded* - so you can check what the AI actually did. The dashboards on top change depending on who signs in; 1,500 prospects move through five parts of the product.",
        images: [
          { src: "assets/img/slides/slide-04.svg", alt: "", caption: "Map of the five parts and how deep each one goes" },
          { src: "assets/img/slides/slide-01.svg", alt: "", caption: "The product at rest - the screen people open first" }
        ]
      },
      {
        title: "The problem",
        headline: "A sales boss and a sales rep cannot share one dashboard",
        body: "The boss asks whether they will hit the number this quarter. The rep asks who to call today. One shared dashboard makes *both of them hunt* for their half of it. And separately: nobody deploys an AI they cannot *predict*.",
        images: [
          { src: "assets/img/slides/slide-04.svg", alt: "", caption: "Side-by-side of what each role needs - almost no overlap" },
          { src: "assets/img/slides/slide-01.svg", alt: "", caption: "The boss's dashboard, full length" }
        ],
      },
      {
        title: "The old way",
        type: "statement",
        headline: "What people were doing before this",
        body: "[How the team got these answers before. What it cost them: time, arguments, missed follow-ups. Who felt it worst, and why the obvious fix would not work.]",
        images: [
          { src: "assets/img/slides/slide-01.svg", alt: "", caption: "The old way - a spreadsheet, a rival tool, or a photo of the wall chart" },
          { src: "assets/img/slides/slide-02.svg", alt: "", caption: "The workaround, drawn as steps" }
        ],
      },
      {
        title: "What I tried",
        headline: "What I tried first, and why it did not hold up",
        body: "[The first version - what it was. What broke, and how you noticed. What you changed.] If no earlier frames survive, say so plainly rather than implying they do.",
        images: [
          { src: "assets/img/slides/slide-02.svg", alt: "", caption: "First attempt - a wireframe or an abandoned frame" },
          { src: "assets/img/slides/slide-01.svg", alt: "", caption: "Where it went instead" }
        ],
      },
      {
        title: "One screen, four people",
        headline: "Same building blocks, four different dashboards",
        body: "One screen, four versions - boss, director, manager, rep. Each shows *different numbers* behind different filters, and the rep's swaps charts for a to-do list. The cards and colours stay the same, so it still reads as *one product*.",
        images: [
          { src: "assets/img/slides/slide-01.svg", alt: "", caption: "Close-up: what the boss sees" },
          { src: "assets/img/slides/slide-03.svg", alt: "", caption: "Close-up: what the rep sees" }
        ],
      },
      {
        title: "Showing the detail",
        headline: "Every summary number opens up",
        body: "Big numbers start arguments; the detail behind them ends them. *Every summary opens in place*, so you keep your spot, and each AI run gets its own page. Insight cards end with a *suggested next step*, not just a chart.",
        images: [
          { src: "assets/img/slides/slide-02.svg", alt: "", caption: "Three frames: closed, one step open, the detail underneath" },
          { src: "assets/img/slides/slide-01.svg", alt: "", caption: "A single AI run, including a failed one" }
        ]
      },
      {
        title: "Setting up an agent",
        headline: "Eight small steps instead of one long form",
        body: "Setting up an agent means seven unrelated decisions. On one screen that looks impossible; as *eight small steps*, each one is easy. Personality is five sliders, not a prompt box - *no technical skill needed* - and the last step summarises it all.",
        images: [
          { src: "assets/img/slides/slide-02.svg", alt: "", caption: "All eight steps in a row" },
          { src: "assets/img/slides/slide-01.svg", alt: "", caption: "The personality step, with the sliders" }
        ],
      },
      {
        title: "Making it safe to trust",
        headline: "The safety settings are a step you cannot skip",
        body: "A field sets what the agent says when asked “are you a bot?”, and a *safety step* covers the claims it must never make. Failed runs are logged and *visible, not hidden*. Honestly: this guides the AI, it cannot guarantee how it behaves.",
        images: [
          { src: "assets/img/slides/slide-01.svg", alt: "", caption: "The safety step and the bot-disclosure field, labelled" },
          { src: "assets/img/slides/slide-01.svg", alt: "", caption: "A run that failed, shown as a failure" }
        ]
      },
      {
        title: "Craft",
        headline: "Every number has context, and every screen shares the same parts",
        body: "A percentage always carries the count behind it - *60% of 258*, never a bare 60%. One card design is reused more than forty times, and six written rules kept five areas consistent. Honest gap: spacing never got written down.",
        images: [
          { src: "assets/img/slides/slide-01.svg", alt: "", caption: "One card pulled apart, with each piece labelled" },
          { src: "assets/img/slides/slide-01.svg", alt: "", caption: "The same card in three different places" }
        ],
      },
      {
        title: "The journey",
        headline: "From signing in to checking what the AI did",
        body: "Sign in, build an agent, correct it, launch it, read the results - the *only path* that touches every part of the product. It ends in *evidence* rather than a confirmation screen. Ten screens, numbered, with one line of intent each.",
        images: [
          { src: "assets/img/slides/slide-02.svg", alt: "", caption: "The ten-screen path, numbered" },
          { src: "assets/img/slides/slide-01.svg", alt: "", caption: "Reading what it did" }
        ],
      },
      {
        title: "On a phone",
        headline: "The side menu becomes a tab bar",
        body: "The side menu becomes a *row of tabs* along the bottom, the number tiles stack two by two, and tables scroll sideways instead of quietly dropping columns. Honest gap: it gets awkward on small laptops and still needs work.",
        images: [
          { src: "assets/img/slides/slide-03.svg", alt: "", caption: "Phone size" },
          { src: "assets/img/slides/slide-01.svg", alt: "", caption: "Desktop size" }
        ]
      },
      {
        title: "What I owned",
        type: "full",
        headline: "What I owned, and what I gave up to move fast",
        body: "[Add: what you led.] [Add: what you did not own - brand, copy, data.] I chose a *dark theme first*, which is why light mode came later and is unfinished, and chose dense screens for people who scan - at the cost of a long page.",
        images: [
          { src: "assets/img/slides/slide-01.svg", alt: "", caption: "Dark and light side by side, showing what light mode still misses" }
        ]
      },
      {
        title: "What happened",
        headline: "What shipped, and the first thing I would change",
        body: "[What shipped, in one line.] [Add a real number here, or say plainly that it was not measured.] Light mode arrived late and parts of it never got themed; next time I would *set the colours up once* and switch themes, rather than patch them afterwards.",
        images: [
          { src: "assets/img/slides/slide-01.svg", alt: "", caption: "What shipped - the strongest single screen, full width" },
          { src: "assets/img/slides/slide-01.svg", alt: "", caption: "The two light-mode problems, each marked with its fix" }
        ],
      }
    ],
    year: '2025 - 2026',
    role: 'Product Designer',
    scope: 'Product UI + flows',
    href: '#',
    cover: 'assets/img/covers/cover-05.svg',
    coverTag: 'AI · Fintech',
    status: 'placeholder'
  },
  {
    index: '03',
    title: 'Daughters App',
    tone: 'kraft',
    attach: 'note',
    tools: ['Figma', 'Prototyping', 'iOS HIG'],
    category: 'Mobile Product Design',
    blurb: 'Making a women\'s faith app usable on iOS before it launched.',
    hook: 'The first session had to work, or there was no product.',
    stamp: 'Filed',
    detail: 'Daughters App is an upcoming iPhone product for women who want to practise faith together. I was the Product/UX Designer. The first session had to complete that job, or there was nothing to launch.',
    slides: [
      {
        title: 'The first session',
        type: 'open',
        headline: 'The first session had to work, or there was no product',
        body: 'An iPhone product for women who want to *pray and practise faith together*. If she could not complete that job in session one, there was nothing to launch.',
        images: [
          { src: 'assets/img/daughters/daughters-hero.webp', alt: 'Daughters iPhone mockups', caption: 'The product, in the hand', frame: 'print' },
          { src: 'assets/img/daughters/mockup-1.webp', alt: 'Daughters home mockup', caption: 'Home, as designed', frame: 'photo' }
        ]
      },
      {
        title: 'What I owned',
        type: 'scope',
        headline: 'What I owned, and what I did not',
        body: 'I produced *20+ wireframes, prototypes, and high-fidelity screens* from stakeholder feedback, information architecture, and personas. I did not write the theology or build the backend.',
        owned: ['Primary iOS flow', '20+ screens and prototypes', 'Accessibility'],
        not: ['Theology', 'Backend', 'A live launch']
      },
      {
        title: 'The problem',
        type: 'problem',
        headline: 'Too many jobs before the first success',
        body: 'She opened the app to *pray*. The first path asked for everything else first.',
        marks: [
          { label: 'Set up a feed', strike: true },
          { label: 'Join groups', strike: true },
          { label: 'Meet an AI Bible companion', strike: true },
          { label: 'Pray', keep: true }
        ],
        images: [
          { src: 'assets/img/daughters/homepage.webp', alt: 'Daughters home screen', caption: 'Home, first session', frame: 'device' }
        ]
      },
      {
        title: 'The decision',
        type: 'statement',
        headline: 'First session completes one job, and nothing else',
        body: 'Social extras moved later. Groups, a customisable feed, and Bible GPT still belong in the product. They do not belong before the first success.',
        aside: 'Protect the job.',
        images: [
          { src: 'assets/img/daughters/flow-diagram-2.webp', alt: 'Earlier primary user flow', caption: 'Primary flow, first version', stamp: 'Was' },
          { src: 'assets/img/daughters/flow-diagram.webp', alt: 'Later primary user flow', caption: 'Primary flow, latest version', stamp: 'Now' }
        ]
      },
      {
        title: 'What the screens had to do',
        type: 'craft',
        headline: 'Behave like iOS, not like a brochure',
        body: 'It had to work for people who are not young, not expert, and not perfectly sighted. I designed against those constraints, using *iOS patterns and WCAG practices*.',
        images: [
          { src: 'assets/img/daughters/daughters-wireframe.webp', alt: 'Early Daughters wireframes', caption: 'Early wireframes', frame: 'print' },
          { src: 'assets/img/daughters/mockup-2.webp', alt: 'Daughters iPhone mockup', caption: 'High-fidelity, in a phone', frame: 'photo' }
        ]
      },
      {
        title: 'Prayer is the product',
        type: 'proof',
        headline: 'Prayer is the product, not the decoration',
        body: 'A virtual Wailing Wall, prayer notes, groups, a Bible companion. Those are *what the product is*. Proof is whether the first session can complete a prayer without help.',
        images: [
          { src: 'assets/img/daughters/mockup-4.webp', alt: 'Prayer mockup on iPhone', caption: 'Prayer, in the hand', frame: 'sticky' },
          { src: 'assets/img/daughters/mockup-5.webp', alt: 'Prayer notes mockup', caption: 'Notes on the wall', frame: 'print' }
        ]
      },
      {
        title: 'After the first success',
        type: 'close',
        headline: 'The rest of the product can wait',
        body: 'A feed, a journal, a group chat. This product was upcoming. I will not claim live retention or revenue. What existed was a *designed primary path* and a Figma source of truth.',
        aside: 'No live metrics claimed.',
        images: [
          { src: 'assets/img/daughters/profile-page---feed.webp', alt: 'Daughters profile feed', caption: 'Profile and feed', frame: 'device' },
          { src: 'assets/img/daughters/chat---prayer-chain.webp', alt: 'Prayer chain in group chat', caption: 'A prayer chain', frame: 'device' }
        ]
      }
    ],
    year: 'Aug 2023 - present',
    role: 'Product/UX Designer',
    scope: 'iOS, primary flow, accessibility',
    href: '#',
    cover: 'assets/img/daughters/daughters-hero.webp',
    coverTag: 'iOS · Faith · First session',
    status: 'live'
  },
  {
    index: '04',
    title: 'Kotal App',
    tone: 'manila',
    tools: ['Figma', 'Prototyping'],
    category: 'Mobile Product Design',
    blurb: 'A second phone app from the same years. Content comes next.',
    detail: 'Kotal is parked here so Daughters can stand alone. Copy and screens still to come.',
    slides: [
      {
        title: 'Next',
        type: 'statement',
        headline: 'Kotal is next, after Daughters is locked',
        body: 'This folder is a *placeholder*. Daughters is the case we are filling first.'
      }
    ],
    year: '2022 - 2024',
    role: 'Product Designer',
    scope: 'Mobile',
    href: '#',
    cover: 'assets/img/covers/cover-04.svg',
    coverTag: 'Mobile',
    status: 'placeholder'
  },
  {
    index: '05',
    title: 'Agentic AI Workflow Design',
    tone: 'sage',
    tools: ['Figma', 'n8n', 'Claude'],
    category: 'Research & Automation · October + AIDLC',
    blurb: 'Teaching software to do the repetitive parts of design work. No screens to show.',
    detail: 'Research and automation work on agentic AI workflows with October and AIDLC. This is a systems and process piece rather than a screen-design project, so there is no interface work to show. Replace this paragraph with the framing you prefer.',
    slides: [
      {
        title: "Context",
        headline: "Repetitive design work, and whether *software could take it*",
        body: "[Where this sat - company, product, moment. Who asked for it and why. What existed before you started.]",
      },
      {
        title: "The problem",
        type: "statement",
        headline: "The same work, done by hand, every time",
        body: "[What was broken, in one plain line. Who it hurt and how often. Why the obvious fix would not work.]",
        images: [
          { src: "assets/img/slides/slide-01.svg", alt: "", caption: "Where it broke, marked up" },
          { src: "assets/img/slides/slide-02.svg", alt: "", caption: "The path that failed, drawn as steps" }
        ],
      },
      {
        title: "What we automated",
        headline: "What we handed to software, and what we kept",
        body: "[The main task, step by step. What you removed to shorten it. What you deliberately kept.]",
        images: [
          { src: "assets/img/slides/slide-01.svg", alt: "", caption: "Before" },
          { src: "assets/img/slides/slide-01.svg", alt: "", caption: "After" }
        ],
      },
      {
        title: "The pipeline",
        headline: "How a request becomes finished work",
        body: "[The path someone takes, start to finish. Where it used to break. What you changed about it.]",
        images: [
          { src: "assets/img/slides/slide-02.svg", alt: "", caption: "Stage pipeline" },
          { src: "assets/img/slides/slide-04.svg", alt: "", caption: "Decision points" }
        ],
      },
      {
        title: "Guardrails",
        type: "full",
        headline: "What stops it doing the wrong thing confidently",
        body: "[What the system is not allowed to do. How you make that visible. What happens when it goes wrong.]",
        images: [
          { src: "assets/img/slides/slide-04.svg", alt: "", caption: "Control layers" }
        ]
      },
      {
        title: "Where humans decide",
        type: "full",
        headline: "The points where a person still has to choose",
        body: "[What stays a human decision. What the machine prepares for them. Why that line sits there.]",
        images: [
          { src: "assets/img/slides/slide-04.svg", alt: "", caption: "Division of labour" }
        ]
      },
      {
        title: "Measuring it",
        headline: "[How we knew whether it was working]",
        body: "[What you tracked. What it told you. What you would measure next time.]",
        images: [
          { src: "assets/img/slides/slide-01.svg", alt: "", caption: "The numbers you watched" },
          { src: "assets/img/slides/slide-04.svg", alt: "", caption: "What you would measure next" }
        ],
      },
      {
        title: "What broke",
        headline: "[What went wrong, and what it taught us]",
        body: "[What went wrong. Why. What you changed.]",
        images: [
          { src: "assets/img/slides/slide-01.svg", alt: "", caption: "The failure, as the user met it" },
          { src: "assets/img/slides/slide-02.svg", alt: "", caption: "Why it happened" }
        ],
      },
      {
        title: "Outcome",
        type: "full",
        headline: "[What this changed for the team]",
        body: "[What shipped. What changed for the people using it. Add a real number, or say it was not measured.]",
        images: [
          { src: "assets/img/slides/slide-02.svg", alt: "", caption: "Current workflow" }
        ]
      },
      {
        title: "Next",
        headline: "[Where this goes next]",
        body: "[What is next. What would have to be true first. How you would know it worked.]",
        images: [
          { src: "assets/img/slides/slide-04.svg", alt: "", caption: "What comes next" },
          { src: "assets/img/slides/slide-01.svg", alt: "", caption: "A rough frame of it" }
        ],
      }
    ],
    year: 'Ongoing',
    role: 'Design Technologist',
    scope: 'Research + automation · no screen designs',
    href: '#',
    cover: 'assets/img/covers/cover-03.svg',
    coverTag: 'Research · Automation',
    status: 'placeholder'
  }

  /* ── Older case studies that already exist on the site, ready to paste in ──
  ,{
    index: '05', title: 'Fruitful Inc.', category: 'Product / UX Case Study',
    blurb: 'Brand, product and interface work for a consumer venture finding its shape.',
    detail: 'Replace with the case study summary.',
    year: '2023', role: 'Product Designer', scope: 'Brand + product UI',
    href: 'Fruitful.html', cover: 'assets/img/covers/cover-02.svg',
    coverTag: 'Consumer · Brand', status: 'live'
  },
  {
    index: '06', title: 'Collaperture', category: 'Product / UX Case Study',
    blurb: 'Collaboration tooling for photographers and the people who hire them.',
    detail: 'Replace with the case study summary.',
    year: '2022', role: 'Product Designer', scope: 'Concept → UI',
    href: 'Collaperture.html', cover: 'assets/img/covers/cover-02.svg',
    coverTag: 'Collaboration', status: 'live'
  },
  {
    index: '07', title: 'CX Studios', category: 'Product / UX Case Study',
    blurb: 'Studio site and booking experience built around a single clear action.',
    detail: 'Replace with the case study summary.',
    year: '2022', role: 'UX Designer', scope: 'Web experience',
    href: 'CXStudios.html', cover: 'assets/img/covers/cover-02.svg',
    coverTag: 'Studio · Booking', status: 'live'
  },
  {
    index: '08', title: 'Belle Monde Real Estate', category: 'Brand & Digital',
    blurb: 'Identity and digital presence for a premium residential developer.',
    detail: 'Replace with the case study summary.',
    year: '2020', role: 'Designer', scope: 'Brand + web',
    href: 'Real-estate-brand.html', cover: 'assets/img/covers/cover-02.svg',
    coverTag: 'Brand · Real estate', status: 'live'
  }
  ───────────────────────────────────────────────────────────────────────── */
];
