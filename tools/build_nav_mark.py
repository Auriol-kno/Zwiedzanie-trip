#!/usr/bin/env python3
"""8.15.0 — assets/brand-mark-nav.svg: kafelek mapy Polski z dolnego menu.
Powstaje z assets/brand-mark.svg: niebieska pinezka na końcu trasy zostaje zastąpiona dłonią „kliknij”
(ikona touch_app, Material Icons, Apache-2.0) z łagodnym ruchem dotknięcia (wyłączanym przy prefers-reduced-motion)."""
from pathlib import Path
ROOT = Path(__file__).resolve().parents[1]
s = (ROOT / "assets/brand-mark.svg").read_text(encoding="utf-8")
a = s.index('<g transform="translate(130 81.5) scale(1.25)">')
b = s.index("</g>", a) + 4
hand = ('<g class="tap"><g transform="translate(96 46) scale(3.3)">'
        '<path fill="#FFFFFF" stroke="#4F532C" stroke-width="1.1" stroke-linejoin="round" '
        'd="M9 11.24V7.5C9 6.12 10.12 5 11.5 5S14 6.12 14 7.5v3.74c1.21-.81 2-2.18 2-3.74C16 5.01 13.99 3 11.5 3S7 5.01 7 7.5c0 1.56.79 2.93 2 3.74zm9.84 4.63l-4.54-2.26c-.17-.07-.35-.11-.54-.11H13v-6c0-.83-.67-1.5-1.5-1.5S10 6.67 10 7.5v10.74l-3.43-.72c-.08-.01-.15-.03-.24-.03-.31 0-.59.13-.79.33l-.79.8 4.94 4.94c.27.27.65.44 1.06.44h6.79c.75 0 1.33-.55 1.44-1.28l.75-5.27c.01-.07.02-.14.02-.2 0-.62-.38-1.16-.91-1.38z"/>'
        '</g></g>')
style = ('<style>.tap{transform-box:fill-box;transform-origin:50% 100%;animation:tap 2.4s ease-in-out infinite}'
         '@keyframes tap{0%,60%,100%{transform:translateY(0) scale(1)}74%{transform:translateY(5px) scale(.94)}86%{transform:translateY(0) scale(1)}}'
         '@media(prefers-reduced-motion:reduce){.tap{animation:none}}</style>')
out = s[:a] + hand + s[b:]
out = out.replace("</svg>", style + "</svg>", 1)
(ROOT / "assets/brand-mark-nav.svg").write_text(out, encoding="utf-8")
print("OK: assets/brand-mark-nav.svg (dłoń zamiast pinezki)")
