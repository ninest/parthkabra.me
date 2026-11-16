# /// script
# requires-python = ">=3.10"
# dependencies = ["fonttools[woff]==4.60.1"]
# ///
"""Cuts the site's fonts out of Allo (npm `allo-font`) into src/assets/fonts/. Run with `npm run fonts`.

Allo's variable font is 442 KB: every script it covers, and three axes (opsz 9-32, wght 100-900, ROND 0-100).
The site needs a sliver of that, so each entry in CUTS below keeps only the characters and axis ranges one use
needs. Each cut is its own @font-face family in src/styles/fonts.css, and browsers download a family only when
something on the page renders in it, so a heavy cut costs nothing on pages that don't use it.

The cuts:
- "Allo": all text. Roundness fixed at 50 (Allo's default), weights 400-900, optical size kept so that titles
  get Allo's display cut. Preloaded by Base.astro.
- "Allo" italic: the obliques (separate static files in Allo, not an axis), one per weight from 400 to 900.
- "Allo Logo": only the letters of the wordmark (src/components/wordmark.astro), as a static instance at its
  exact style. Change the wordmark's text or style and you must change this cut to match, or the new letters
  fall back to "Allo".
- "Allo Full": every axis at full range, for page titles that set `theme.title.roundness` (src/lib/theme.ts).

To add a style (a weight outside 400-900, a roundness, more characters): widen a cut's `axes` or `unicodes`, or
add a cut with its own family name and an @font-face for it in fonts.css, then run `npm run fonts` and commit
the regenerated files. Upgrading `allo-font` also means running it again.
"""

from pathlib import Path

from fontTools import subset
from fontTools.ttLib import TTFont
from fontTools.varLib.instancer import instantiateVariableFont

SITE = Path(__file__).resolve().parent.parent
SOURCE = SITE / "node_modules/allo-font/fonts/webfonts"
OUT = SITE / "src/assets/fonts"

# Latin: ASCII, Latin-1, and the punctuation, symbols and arrows that English text uses
LATIN = (
    "U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+0304,U+0308,U+0329,"
    "U+2000-206F,U+20AC,U+2122,U+2190-2199,U+2212,U+2215,U+FEFF,U+FFFD"
)
OBLIQUES = {400: "Oblique", 500: "MediumOblique", 600: "SemiBoldOblique", 700: "BoldOblique", 800: "ExtraBoldOblique", 900: "BlackOblique"}

# out file: (source file, characters to keep, axis limits: a number pins the axis, a (min, max) range trims it)
CUTS = {
    "allo-text.woff2": ("AlloVariable.woff2", {"unicodes": LATIN}, {"ROND": 50, "wght": (400, 900)}),
    "allo-logo.woff2": ("AlloVariable.woff2", {"text": "Parth Kabra"}, {"ROND": 100, "opsz": 14, "wght": 750}),
    "allo-full.woff2": ("AlloVariable.woff2", {"unicodes": LATIN}, {}),
    **{f"allo-{w}-oblique.woff2": (f"Allo-{name}.woff2", {"unicodes": LATIN}, {}) for w, name in OBLIQUES.items()},
}


def cut(source: str, chars: dict, axes: dict) -> TTFont:
    font = TTFont(SOURCE / source)
    options = subset.Options()
    options.layout_features = ["*"]  # keep every OpenType feature (ss01, tnum, ...) for the glyphs kept
    options.name_IDs = ["*"]
    subsetter = subset.Subsetter(options)
    if "text" in chars:
        subsetter.populate(text=chars["text"])
    else:
        subsetter.populate(unicodes=subset.parse_unicodes(chars["unicodes"]))
    subsetter.subset(font)
    if axes:
        font = instantiateVariableFont(font, axes)
    font.flavor = "woff2"
    return font


OUT.mkdir(parents=True, exist_ok=True)
for out, (source, chars, axes) in CUTS.items():
    cut(source, chars, axes).save(OUT / out)
    print(f"{out}: {(OUT / out).stat().st_size / 1024:.1f} KB")
