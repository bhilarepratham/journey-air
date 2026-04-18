import streamlit as st
import streamlit.components.v1 as components

st.set_page_config(page_title="Journey Air", layout="wide")

components.html(
    """
    <!doctype html>
    <html>
    <head>
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        html, body {
          margin: 0;
          padding: 0;
          width: 100%;
          height: 100%;
          overflow: hidden;
        }
        iframe {
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          border: 0;
        }
      </style>
    </head>
    <body>
      <iframe src="https://journey-air.onrender.com"></iframe>
    </body>
    </html>
    """,
    height=1000,
    scrolling=False,
)
