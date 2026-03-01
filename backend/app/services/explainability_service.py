"""Grad-CAM and explainability for CNN predictions."""
import io
import base64
from pathlib import Path
from typing import Optional, Tuple, Dict
import numpy as np
from PIL import Image

from app.core.config import get_settings

settings = get_settings()
_model = None
_last_conv_layer_name: Optional[str] = None


def _get_model():
    global _model
    if _model is not None:
        return _model
    if not settings.enable_gradcam or not settings.model_path:
        return None
    path = Path(settings.model_path)
    if not path.exists():
        return None
    try:
        import tensorflow as tf
        _model = tf.keras.models.load_model(path)
        for layer in reversed(_model.layers):
            if "conv" in layer.name.lower() or "conv2d" in layer.name.lower():
                global _last_conv_layer_name
                _last_conv_layer_name = layer.name
                break
        return _model
    except Exception:
        return None


def _preprocess(img: Image.Image, size: Tuple[int, int] = (224, 224)) -> np.ndarray:
    img = img.convert("RGB").resize(size, Image.Resampling.LANCZOS)
    arr = np.array(img, dtype=np.float32) / 255.0
    return np.expand_dims(arr, axis=0)


def compute_gradcam_heatmap(image: Image.Image, class_idx: Optional[int] = None) -> Optional[str]:
    """Compute Grad-CAM heatmap and return base64 PNG."""
    model = _get_model()
    if model is None or _last_conv_layer_name is None:
        return None
    try:
        import tensorflow as tf
        inp = _preprocess(image)
        conv_layer = model.get_layer(_last_conv_layer_name)
        grad_model = tf.keras.Model(model.inputs, [conv_layer.output, model.output])
        with tf.GradientTape() as tape:
            conv_output, preds = grad_model(inp)
            if class_idx is None:
                class_idx = np.argmax(preds[0])
            loss = preds[:, class_idx]
        grads = tape.gradient(loss, conv_output)
        pooled = tf.reduce_mean(grads, axis=(0, 1, 2))
        heatmap = conv_output[0] @ pooled
        heatmap = tf.nn.relu(heatmap).numpy()
        heatmap = (heatmap - heatmap.min()) / (heatmap.max() - heatmap.min() + 1e-8)
        heatmap = np.uint8(255 * heatmap)
        heatmap_img = Image.fromarray(heatmap).resize((image.size[0], image.size[1]), Image.Resampling.LANCZOS)
        heatmap = np.array(heatmap_img)
        heatmap_colored = np.stack([heatmap, np.zeros_like(heatmap), 255 - heatmap], axis=-1)
        overlay = (np.array(image.convert("RGB")).astype(float) * 0.5 + heatmap_colored.astype(float) * 0.5).astype(np.uint8)
        out = Image.fromarray(overlay)
        buf = io.BytesIO()
        out.save(buf, format="PNG")
        return base64.b64encode(buf.getvalue()).decode()
    except Exception:
        return None


def get_feature_importance(class_name: str, top_k: int = 5) -> Dict[str, float]:
    """Placeholder: return synthetic feature importance based on class."""
    # Real impl would use attention weights or SHAP
    return {f"feature_{i}": 1.0 - i * 0.15 for i in range(min(top_k, 5))}
