import streamlit as st
import streamlit.components.v1 as components
from pathlib import Path

st.set_page_config(page_title="Journey Air", layout="wide")

html = Path("index.html").read_text(encoding="utf-8")
css = Path("styles.css").read_text(encoding="utf-8")

# Replace the stylesheet link in index.html with inline CSS so it works in Streamlit
html = html.replace('<link rel="stylesheet" href="styles.css">', f"<style>{css}</style>")

components.html(html, height=1200, scrolling=True)
