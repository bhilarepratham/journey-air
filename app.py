import re
from pathlib import Path
import streamlit as st
import streamlit.components.v1 as components

st.set_page_config(page_title="Journey Air", layout="wide")

# Read files
html = Path("index.html").read_text(encoding="utf-8")
css = Path("styles.css").read_text(encoding="utf-8")
js = Path("app.js").read_text(encoding="utf-8")

# Inline CSS
html = re.sub(
    r'<link[^>]*href=["\']styles\.css["\'][^>]*>',
    f"<style>{css}</style>",
    html,
    flags=re.IGNORECASE,
)

# Inline JS
html = re.sub(
    r'<script[^>]*src=["\']app\.js["\'][^>]*></script>',
    f"<script>{js}</script>",
    html,
    flags=re.IGNORECASE,
)

# Fallback (in case tags not found)
if "<style>" not in html:
    html = html.replace("</head>", f"<style>{css}</style></head>")

if "<script>" not in html:
    html = html.replace("</body>", f"<script>{js}</script></body>")

# Render in Streamlit
components.html(html, height=1200, scrolling=True)
