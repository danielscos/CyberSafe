# CyberSafe/backend/hook-google.generativeai.py

from PyInstaller.utils.hooks import collect_submodules, collect_data_files

# Collect all submodules of google.generativeai
hiddenimports = collect_submodules('google.generativeai')

# Collect all data files used by google.generativeai
datas = collect_data_files('google.generativeai', includes=['*'])
