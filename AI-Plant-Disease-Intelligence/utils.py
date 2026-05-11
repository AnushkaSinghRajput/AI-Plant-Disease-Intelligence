"""Shared utilities for plant disease training and prediction."""

from __future__ import annotations

import json
from pathlib import Path
from typing import Dict, Iterable, List, Sequence, Tuple

import matplotlib

matplotlib.use("Agg")

import matplotlib.pyplot as plt
import numpy as np
import tensorflow as tf
from PIL import Image, UnidentifiedImageError
from sklearn.metrics import classification_report, confusion_matrix


REPO_ROOT = Path(__file__).resolve().parent
DATASET_DIR = REPO_ROOT / "dataset"
MODELS_DIR = REPO_ROOT / "models"
SAVED_MODELS_DIR = REPO_ROOT / "saved_models"
LEGACY_SAVED_MODELS_DIR = REPO_ROOT / "model" / "saved_models"
LABELS_DIR = REPO_ROOT / "model" / "labels"
LOGS_DIR = REPO_ROOT / "logs"
PLOTS_DIR = REPO_ROOT / "plots"

SUPPORTED_BACKBONES: Dict[str, Dict[str, object]] = {
    "resnet50": {"size": (224, 224), "factory": tf.keras.applications.ResNet50},
    "vgg16": {"size": (224, 224), "factory": tf.keras.applications.VGG16},
    "inceptionv3": {"size": (299, 299), "factory": tf.keras.applications.InceptionV3},
    "mobilenetv2": {"size": (224, 224), "factory": tf.keras.applications.MobileNetV2},
    "efficientnetb3": {"size": (300, 300), "factory": tf.keras.applications.EfficientNetB3},
}


def ensure_project_dirs() -> None:
    """Create runtime directories used by training and deployment."""
    for directory in (
        MODELS_DIR,
        SAVED_MODELS_DIR,
        LEGACY_SAVED_MODELS_DIR,
        LABELS_DIR,
        LOGS_DIR,
        PLOTS_DIR,
        DATASET_DIR,
    ):
        directory.mkdir(parents=True, exist_ok=True)


def canonical_backbone(backbone: str) -> str:
    """Normalize user input such as MobileNetV2 into internal keys."""
    key = backbone.replace("_", "").replace("-", "").lower()
    aliases = {"mobilenet": "mobilenetv2", "inception": "inceptionv3", "efficientnet": "efficientnetb3"}
    key = aliases.get(key, key)
    if key not in SUPPORTED_BACKBONES:
        supported = ", ".join(sorted(SUPPORTED_BACKBONES))
        raise ValueError(f"Unsupported backbone '{backbone}'. Choose one of: {supported}")
    return key


def get_backbone_input_size(backbone: str) -> Tuple[int, int]:
    """Return the default image size for a supported backbone."""
    key = canonical_backbone(backbone)
    return SUPPORTED_BACKBONES[key]["size"]  # type: ignore[return-value]


def get_model_input_size(model: tf.keras.Model, fallback: Tuple[int, int] = (224, 224)) -> Tuple[int, int]:
    """Infer image size from a loaded Keras model."""
    input_shape = model.input_shape
    if isinstance(input_shape, list):
        input_shape = input_shape[0]
    if len(input_shape) >= 4 and input_shape[1] and input_shape[2]:
        return int(input_shape[1]), int(input_shape[2])
    return fallback


def load_and_resize(image_path: str | Path, img_size: Tuple[int, int]) -> np.ndarray:
    """Load an image from disk, convert to RGB, and resize for the model."""
    path = Path(image_path)
    if not path.exists() or not path.is_file():
        raise FileNotFoundError(f"Invalid image path: {path}")

    try:
        with Image.open(path) as image:
            image = image.convert("RGB")
            image = image.resize(img_size, Image.Resampling.LANCZOS)
            return np.asarray(image, dtype=np.float32)
    except UnidentifiedImageError as exc:
        raise ValueError(f"Corrupted or unsupported image file: {path}") from exc
    except OSError as exc:
        raise ValueError(f"Could not read image file: {path}") from exc


def normalize(img: np.ndarray) -> np.ndarray:
    """Normalize pixels to [0, 1] and add the batch dimension."""
    img = img.astype(np.float32) / 255.0
    return np.expand_dims(img, axis=0)


def extract_class_names(data_dir: str | Path) -> List[str]:
    """Extract class names from a dataset directory with class subfolders."""
    path = Path(data_dir)
    if not path.exists():
        raise FileNotFoundError(f"Dataset directory not found: {path}")

    candidate = path / "train" if (path / "train").is_dir() else path
    class_names = sorted(p.name for p in candidate.iterdir() if p.is_dir() and not p.name.startswith("."))
    if not class_names:
        raise ValueError(f"No class folders found in dataset directory: {candidate}")
    return class_names


def save_class_names(class_names: Sequence[str], class_indices: Dict[str, int]) -> None:
    """Persist labels for CLI prediction and the FastAPI backend."""
    payload = {"classes": list(class_names), "indices": class_indices}
    for path in (SAVED_MODELS_DIR / "class_names.json", LABELS_DIR / "class_names.json"):
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_text(json.dumps(payload, indent=2), encoding="utf-8")


def load_class_names(labels_path: str | Path | None = None, data_dir: str | Path | None = None) -> List[str]:
    """Load labels from JSON, or extract them from the dataset when available."""
    paths = []
    if labels_path:
        paths.append(Path(labels_path))
    paths.extend([SAVED_MODELS_DIR / "class_names.json", LABELS_DIR / "class_names.json"])

    for path in paths:
        if path.exists():
            data = json.loads(path.read_text(encoding="utf-8"))
            if isinstance(data, list):
                return data
            classes = data.get("classes") or data.get("class_names")
            if classes:
                return list(classes)

    if data_dir:
        return extract_class_names(data_dir)
    raise FileNotFoundError("Class names not found. Train a model first or pass --labels-path.")


def save_history_plots(histories: Iterable[tf.keras.callbacks.History], output_path: str | Path) -> None:
    """Save combined accuracy and loss graphs from one or more fit phases."""
    metrics: Dict[str, List[float]] = {"accuracy": [], "val_accuracy": [], "loss": [], "val_loss": []}
    for history in histories:
        for key in metrics:
            metrics[key].extend(history.history.get(key, []))

    plt.figure(figsize=(12, 5))
    plt.subplot(1, 2, 1)
    plt.plot(metrics["accuracy"], label="Train Accuracy")
    if metrics["val_accuracy"]:
        plt.plot(metrics["val_accuracy"], label="Validation Accuracy")
    plt.title("Model Accuracy")
    plt.xlabel("Epoch")
    plt.ylabel("Accuracy")
    plt.legend()

    plt.subplot(1, 2, 2)
    plt.plot(metrics["loss"], label="Train Loss")
    if metrics["val_loss"]:
        plt.plot(metrics["val_loss"], label="Validation Loss")
    plt.title("Model Loss")
    plt.xlabel("Epoch")
    plt.ylabel("Loss")
    plt.legend()
    plt.tight_layout()
    plt.savefig(output_path, dpi=150)
    plt.close()


def evaluate_and_report(
    model: tf.keras.Model,
    dataset: tf.data.Dataset,
    class_names: Sequence[str],
    output_dir: str | Path = PLOTS_DIR,
) -> Tuple[np.ndarray, str]:
    """Print and save a confusion matrix plus sklearn classification report."""
    y_true: List[int] = []
    y_pred: List[int] = []

    for images, labels in dataset:
        preds = model.predict(images, verbose=0)
        y_pred.extend(np.argmax(preds, axis=1).astype(int).tolist())
        y_true.extend(labels.numpy().astype(int).tolist())

    matrix = confusion_matrix(y_true, y_pred)
    report = classification_report(y_true, y_pred, target_names=list(class_names), zero_division=0)

    output_path = Path(output_dir)
    output_path.mkdir(parents=True, exist_ok=True)
    np.savetxt(output_path / "confusion_matrix.csv", matrix, delimiter=",", fmt="%d")
    (output_path / "classification_report.txt").write_text(report, encoding="utf-8")

    plt.figure(figsize=(max(8, len(class_names) * 0.35), max(6, len(class_names) * 0.35)))
    plt.imshow(matrix, interpolation="nearest", cmap="Blues")
    plt.title("Confusion Matrix")
    plt.colorbar()
    tick_marks = np.arange(len(class_names))
    plt.xticks(tick_marks, class_names, rotation=90, fontsize=7)
    plt.yticks(tick_marks, class_names, fontsize=7)
    plt.xlabel("Predicted Label")
    plt.ylabel("True Label")
    plt.tight_layout()
    plt.savefig(output_path / "confusion_matrix.png", dpi=150)
    plt.close()

    print("Confusion matrix saved to:", output_path / "confusion_matrix.csv")
    print("Classification report:\n", report)
    return matrix, report


def export_tflite(model: tf.keras.Model, output_path: str | Path) -> Path:
    """Convert and save the trained Keras model as a deployment-ready TFLite file."""
    converter = tf.lite.TFLiteConverter.from_keras_model(model)
    converter.optimizations = [tf.lite.Optimize.DEFAULT]
    tflite_model = converter.convert()
    output = Path(output_path)
    output.parent.mkdir(parents=True, exist_ok=True)
    output.write_bytes(tflite_model)
    return output
