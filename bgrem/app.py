from flask import Flask, request, send_file
from rembg import remove
from PIL import Image
import io

app = Flask(__name__)

@app.route('/remove-bg', methods=['POST'])
def remove_background():
    file = request.files['image']
    input_image = Image.open(file.stream).convert("RGBA")
    output_image = remove(input_image)

    byte_io = io.BytesIO()
    output_image.save(byte_io, 'PNG')
    byte_io.seek(0)

    return send_file(byte_io, mimetype='image/png')

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001)
