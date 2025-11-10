#!/bin/bash

# Exit immediately if a command exits with a non-zero status.
set -e

echo "--- Installing Python dependencies ---"
pip install -r requirement.txt

echo "--- Downloading Spacy model (en_core_web_sm) ---"
python -m spacy download en_core_web_sm

echo "--- Downloading NLTK data (punkt) ---"
python -c "import nltk; nltk.download('punkt')"

echo "--- Build script finished successfully ---"
