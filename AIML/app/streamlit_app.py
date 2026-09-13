"""Streamlit interface for the privacy-aware audio intelligence pipeline."""

from __future__ import annotations

import io
import json
import sys
from pathlib import Path

import soundfile as sf
import streamlit as st


PROJECT_ROOT = Path(__file__).resolve().parents[2]
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from AIML.pipeline import AudioIntelligencePipeline  # noqa: E402


st.set_page_config(page_title="Vedant", page_icon="◌", layout="wide")


@st.cache_resource(show_spinner=False)
def get_pipeline(model_name: str, language: str | None) -> AudioIntelligencePipeline:
    return AudioIntelligencePipeline(whisper_model=model_name, language=language)


def load_audio(uploaded_file: st.runtime.uploaded_file_manager.UploadedFile):
    """Decode user-provided audio without writing it to disk."""
    waveform, sample_rate = sf.read(io.BytesIO(uploaded_file.getvalue()), dtype="float32", always_2d=False)
    return waveform, sample_rate


st.markdown(
    """
    <style>
        .stApp { background: #f7f7f2; color: #1d2924; }
        [data-testid="stSidebar"] { background: #edf1ea; border-right: 1px solid #d7ded6; }
        .hero { max-width: 780px; padding: 2.5rem 0 1.75rem; }
        .eyebrow { color: #53715e; font-size: .78rem; font-weight: 700; letter-spacing: .13em; text-transform: uppercase; }
        .hero h1 { color: #173b2d; font-size: clamp(2.2rem, 5vw, 4.3rem); line-height: .97; letter-spacing: -.06em; margin: .55rem 0 .8rem; }
        .hero p { color: #52625b; font-size: 1.08rem; line-height: 1.6; max-width: 630px; }
        .section-title { color: #173b2d; font-size: 1.2rem; font-weight: 650; margin: 1.25rem 0 .55rem; }
        .quiet { color: #65736c; font-size: .9rem; }
        [data-testid="stMetric"] { background: #ffffff; border: 1px solid #dfe5dc; border-radius: 10px; padding: .85rem 1rem; }
        .stButton > button { background: #1e5a41; border: 1px solid #1e5a41; border-radius: 7px; color: #fff; font-weight: 650; padding: .55rem 1rem; }
        .stButton > button:hover { background: #173f2f; border-color: #173f2f; color: #fff; }
        [data-testid="stFileUploader"] { background: #fff; border-radius: 10px; padding: .25rem; }
    </style>
    """,
    unsafe_allow_html=True,
)

with st.sidebar:
    st.markdown("### Session settings")
    whisper_model = st.selectbox("Transcription model", ["tiny", "base", "small"], index=1)
    language_choice = st.selectbox("Language", ["Automatic", "English", "Hindi"], index=0)
    language = {"Automatic": None, "English": "en", "Hindi": "hi"}[language_choice]
    document_id = st.text_input("Reference ID", placeholder="Optional — generated if blank")
    st.divider()
    st.caption("Audio is processed in this local session. Sensitive identifiers are redacted before vectors are saved.")

st.markdown(
    """
    <div class="hero">
      <div class="eyebrow">Private audio intelligence</div>
      <h1>Listen closely.<br>Store safely.</h1>
      <p>Transcribe a recording, remove sensitive identifiers, and save only privacy-aware semantic embeddings for retrieval.</p>
    </div>
    """,
    unsafe_allow_html=True,
)

uploaded_audio = st.file_uploader(
    "Choose a recording", type=["wav", "mp3", "m4a", "flac", "ogg"], help="WAV and FLAC offer the most reliable local decoding."
)

if uploaded_audio:
    st.audio(uploaded_audio)
    st.markdown("<p class='quiet'>The original recording is not retained by this app.</p>", unsafe_allow_html=True)

if st.button("Process recording", type="primary", disabled=uploaded_audio is None):
    try:
        waveform, sample_rate = load_audio(uploaded_audio)
        pipeline = get_pipeline(whisper_model, language)
        with st.status("Processing recording…", expanded=True) as status:
            st.write("Preparing audio and loading the transcription model.")
            result = pipeline.run(
                waveform,
                sample_rate,
                document_id=document_id.strip() or None,
                metadata={"filename": uploaded_audio.name},
            )
            status.update(label="Processing complete", state="complete", expanded=False)
        st.session_state["pipeline_result"] = result
    except Exception as error:
        st.error(f"Could not process this recording: {error}")
        st.info("Confirm that Faster-Whisper is installed, Ollama is running, and `nomic-embed-text` has been pulled.")

result = st.session_state.get("pipeline_result")
if result:
    st.divider()
    metrics = st.columns(4)
    metrics[0].metric("Duration", f"{result['audio']['duration_seconds']} s")
    metrics[1].metric("Segments", len(result["transcription"]["segments"]))
    metrics[2].metric("Sensitive items", len(result["privacy"]["entities"]))
    metrics[3].metric("Stored vectors", len(result["embeddings"]))

    transcript_tab, privacy_tab, chunks_tab = st.tabs(["Transcript", "Privacy", "Semantic chunks"])
    with transcript_tab:
        st.markdown("<div class='section-title'>Raw transcription</div>", unsafe_allow_html=True)
        st.write(result["transcription"]["text"] or "No speech was detected.")
    with privacy_tab:
        st.markdown("<div class='section-title'>Redacted text</div>", unsafe_allow_html=True)
        st.write(result["privacy"]["redacted_text"] or "No speech was detected.")
        if result["privacy"]["entities"]:
            st.caption("Detected sensitive identifiers")
            st.dataframe(result["privacy"]["entities"], use_container_width=True, hide_index=True)
        else:
            st.caption("No configured sensitive identifiers were detected.")
    with chunks_tab:
        st.markdown("<div class='section-title'>Ready for retrieval</div>", unsafe_allow_html=True)
        for chunk in result["processing"]["chunks"]:
            st.markdown(f"**Chunk {chunk['chunk_id'] + 1}** · {chunk['word_count']} words")
            st.write(chunk["text"])

    st.download_button(
        "Download processing record",
        data=json.dumps(result, indent=2, ensure_ascii=False),
        file_name="vedant-processing-record.json",
        mime="application/json",
    )
