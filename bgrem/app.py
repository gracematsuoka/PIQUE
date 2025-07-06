from flask import Flask, request, send_file
from rembg import remove, new_session
from PIL import Image
import io
import os

app = Flask(__name__)

rembg_session = None

@app.route('/remove-bg', methods=['POST'])
def remove_background():
    global rembg_session
    if rembg_session is None:
        rembg_session = new_session()
        print("✅ Rembg session initialized.")

    file = request.files['image']
    input_image = Image.open(file.stream).convert("RGBA")
    output_image = remove(input_image, session=rembg_session)

    byte_io = io.BytesIO()
    output_image.save(byte_io, 'PNG')
    byte_io.seek(0)

    return send_file(byte_io, mimetype='image/png')

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=int(os.environ.get('PORT', 5000)))

@app.route('/')
def home():
    return 'App is running ✅'