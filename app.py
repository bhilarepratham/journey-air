import streamlit as st
import streamlit.components.v1 as components

st.set_page_config(page_title="Journey Air", layout="wide")

components.iframe("https://journey-air.onrender.com", height=900, scrolling=True)
