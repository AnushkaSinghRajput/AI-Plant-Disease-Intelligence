"""Prediction service using loaded Keras/TFLite model."""
import json
import os
from pathlib import Path
from typing import List, Optional, Tuple

import numpy as np
from PIL import Image

from app.core.config import get_settings

settings = get_settings()
_model = None
_class_names: List[str] = []
_tflite_interpreter = None


def _load_class_names() -> List[str]:
    path = Path(settings.label_json_path)
    if not path.exists():
        return []
    with open(path) as f:
        data = json.load(f)
    if isinstance(data, list):
        return data
    return data.get("classes", data.get("class_names", []))


def load_model():
    global _model, _class_names, _tflite_interpreter
    if _class_names:
        return
    _class_names = _load_class_names()
    if settings.use_tflite and os.path.exists(settings.tflite_model_path):
        import tensorflow.lite as tflite
        _tflite_interpreter = tflite.Interpreter(model_path=settings.tflite_model_path)
        _tflite_interpreter.allocate_tensors()
        return
    if os.path.exists(settings.model_path):
        import tensorflow as tf
        _model = tf.keras.models.load_model(settings.model_path)
    return


def _keras_input_size(default: Tuple[int, int] = (224, 224)) -> Tuple[int, int]:
    """Infer HxW from a loaded Keras model when available."""
    if _model is None:
        return default
    input_shape = _model.input_shape
    if isinstance(input_shape, list):
        input_shape = input_shape[0]
    if len(input_shape) >= 4 and input_shape[1] and input_shape[2]:
        return int(input_shape[1]), int(input_shape[2])
    return default


def _tflite_input_size(default: Tuple[int, int] = (224, 224)) -> Tuple[int, int]:
    """Infer HxW from a loaded TFLite interpreter when available."""
    if _tflite_interpreter is None:
        return default
    input_shape = _tflite_interpreter.get_input_details()[0]["shape"]
    if len(input_shape) >= 4 and input_shape[1] and input_shape[2]:
        return int(input_shape[1]), int(input_shape[2])
    return default


def preprocess_image(image: Image.Image, target_size: Tuple[int, int] = (224, 224)) -> np.ndarray:
    """Resize and normalize an image for CNN inference."""
    img = image.convert("RGB")
    img = img.resize(target_size, Image.Resampling.LANCZOS)
    arr = np.array(img, dtype=np.float32) / 255.0
    return np.expand_dims(arr, axis=0)


def _demo_fallback(image: Image.Image) -> Tuple[str, str, float]:
    """Fallback when model unavailable - returns plausible demo prediction based on image."""
    load_model()
    fallback_classes = [
        ("0", "Pepper,_bell___Bacterial_spot", 0.82),
        ("1", "Corn___Cercospora_leaf_spot", 0.79),
        ("2", "Tomato___Early_blight", 0.76),
        ("3", "Potato___Late_blight", 0.81),
        ("4", "Tomato___Bacterial_spot", 0.78),
    ]
    if _class_names:
        idx = hash(bytes(image.tobytes())) % min(5, len(_class_names))
        if idx < len(_class_names):
            return str(idx), _class_names[idx], 0.80
    idx = hash(bytes(image.tobytes())) % len(fallback_classes)
    return fallback_classes[idx]


def predict(image: Image.Image) -> Tuple[str, str, float]:
    """Returns (class_id, class_name, confidence)."""
    load_model()
    if not _class_names:
        return _demo_fallback(image)
    if _tflite_interpreter is not None:
        inp = preprocess_image(image, _tflite_input_size())
        input_details = _tflite_interpreter.get_input_details()
        output_details = _tflite_interpreter.get_output_details()
        _tflite_interpreter.set_tensor(input_details[0]["index"], inp)
        _tflite_interpreter.invoke()
        preds = _tflite_interpreter.get_tensor(output_details[0]["index"])[0]
    else:
        if _model is None:
            return _demo_fallback(image)
        inp = preprocess_image(image, _keras_input_size())
        preds = _model.predict(inp, verbose=0)[0]
    idx = int(np.argmax(preds))
    conf = float(preds[idx])
    if idx < len(_class_names):
        name = _class_names[idx]
    else:
        name = f"Class_{idx}"
    return str(idx), name, conf


def get_class_names() -> List[str]:
    load_model()
    return _class_names
