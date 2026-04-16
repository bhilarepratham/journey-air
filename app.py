from pathlib import Path
import re
import streamlit as st
import streamlit.components.v1 as components

st.set_page_config(page_title="Journey Air", layout="wide")

base = Path(__file__).resolve().parent

html = (base / "index.html").read_text(encoding="utf-8")
css = (base / "styles.css").read_text(encoding="utf-8")
js = (base / "app.js").read_text(encoding="utf-8")

html = re.sub(r'<link[^>]*href=["\']styles\.css["\'][^>]*>', f"<style>{css}</style>", html, flags=re.I)
html = re.sub(r'<script[^>]*src=["\']app\.js["\'][^>]*></script>', f"<script>{js}</script>", html, flags=re.I)

components.html(html, height=1200, scrolling=True)
