# Images

## `tanishq-portrait.jpg` — required, not included

The hero expects a portrait at `assets/img/tanishq-portrait.jpg`
(4:5 crop, ~880×1100 px). Until it exists, the hero shows a labelled
placeholder frame naming this exact path. No stock photography is used.

## `slides/` — abstract placeholders

`slide-01…04.svg` stand in for case-study screens. Replace with real screenshots
at roughly 16:10 and point the `images` array in `assets/js/project-data.js` at
them.

**Export them at ~1600px wide.** A slide image is scaled to fit its row, and CSS
only ever scales *down* — an image narrower than its column stays at its own size
and leaves the rest of the row empty. At 1440×900 a full-width slide image gets an
874px column, and two side by side get 655px each, so 1600px covers every case
with room to spare on larger displays. The placeholders declare 1600×1000 over an
800×500 `viewBox` for exactly this reason.

## `covers/` — abstract placeholders

`cover-01…05.svg` are generated, abstract compositions in the site palette —
placeholders, not stock art. Replace them with real project imagery
(~640×440, WebP or JPG) and update the `cover` field in
`assets/js/project-data.js`. `cover-02.svg` is currently unused and free
for a new project.

## Accent colour in SVGs

Both folders hardcode `#00a0a0`. An `<img>` cannot read CSS variables, so if the
accent token changes, find-and-replace it here as well.
