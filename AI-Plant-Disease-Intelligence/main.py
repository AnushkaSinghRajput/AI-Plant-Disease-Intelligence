"""End-to-end TensorFlow plant disease training and prediction CLI.

Examples:
    python main.py train
    python main.py predict path/to/image.jpg
"""

from __future__ import annotations

import argparse
import shutil
from datetime import datetime
from pathlib import Path
from typing import Dict, List, Optional, Sequence, Tuple

import numpy as np
import tensorflow as tf
from tensorflow import keras
from tensorflow.keras import layers

from utils import (
    DATASET_DIR,
    LEGACY_SAVED_MODELS_DIR,
    LOGS_DIR,
    PLOTS_DIR,
    SAVED_MODELS_DIR,
    SUPPORTED_BACKBONES,
    canonical_backbone,
    ensure_project_dirs,
    evaluate_and_report,
    export_tflite,
    extract_class_names,
    get_backbone_input_size,
    get_model_input_size,
    load_and_resize,
    load_class_names,
    normalize,
    save_class_names,
    save_history_plots,
)


AUTOTUNE = tf.data.AUTOTUNE
DEFAULT_BATCH_SIZE = 32
DEFAULT_EPOCHS = 15
DEFAULT_FINE_TUNE_EPOCHS = 5
INITIAL_LR = 1e-4
FINE_TUNE_LR = 1e-5
UNFREEZE_LAST_N_LAYERS = 20


def _clean_backbone_name(backbone: str) -> str:
    """Return a user-friendly artifact suffix."""
    key = canonical_backbone(backbone)
    return "mobilenet" if key == "mobilenetv2" else key


def _find_dataset_split_dirs(data_dir: Path) -> Tuple[Path, Optional[Path], Optional[Path]]:
    """Support dataset/train, dataset/val, dataset/test, or class folders directly."""
    train_dir = data_dir / "train"
    if train_dir.is_dir():
        val_dir = data_dir / "val"
        if not val_dir.is_dir():
            val_dir = data_dir / "validation"
        test_dir = data_dir / "test"
        return train_dir, val_dir if val_dir.is_dir() else None, test_dir if test_dir.is_dir() else None
    return data_dir, None, None


def _prepare_dataset(ds: tf.data.Dataset, cache: bool = True, shuffle: bool = False) -> tf.data.Dataset:
    """Apply tf.data performance optimizations."""
    ds = ds.map(lambda images, labels: (tf.cast(images, tf.float32) / 255.0, labels), num_parallel_calls=AUTOTUNE)
    if cache:
        ds = ds.cache()
    if shuffle:
        ds = ds.shuffle(1024)
    return ds.prefetch(AUTOTUNE)


def create_datasets(
    data_dir: Path,
    img_size: Tuple[int, int],
    batch_size: int,
    validation_split: float,
    seed: int,
    cache: bool,
) -> Tuple[tf.data.Dataset, tf.data.Dataset, tf.data.Dataset, List[str]]:
    """Build optimized train, validation, and test datasets."""
    if not data_dir.exists():
        raise FileNotFoundError(
            f"Dataset directory not found: {data_dir}. Put class folders in dataset/ or pass --data-dir."
        )

    train_dir, val_dir, test_dir = _find_dataset_split_dirs(data_dir)
    class_names = extract_class_names(data_dir)

    if val_dir:
        train_ds = tf.keras.utils.image_dataset_from_directory(
            train_dir,
            image_size=img_size,
            batch_size=batch_size,
            label_mode="int",
            shuffle=True,
            seed=seed,
        )
        val_ds = tf.keras.utils.image_dataset_from_directory(
            val_dir,
            image_size=img_size,
            batch_size=batch_size,
            label_mode="int",
            shuffle=False,
        )
    else:
        train_ds = tf.keras.utils.image_dataset_from_directory(
            train_dir,
            image_size=img_size,
            batch_size=batch_size,
            label_mode="int",
            validation_split=validation_split,
            subset="training",
            shuffle=True,
            seed=seed,
        )
        val_ds = tf.keras.utils.image_dataset_from_directory(
            train_dir,
            image_size=img_size,
            batch_size=batch_size,
            label_mode="int",
            validation_split=validation_split,
            subset="validation",
            shuffle=False,
            seed=seed,
        )
        class_names = train_ds.class_names

    if test_dir:
        test_ds = tf.keras.utils.image_dataset_from_directory(
            test_dir,
            image_size=img_size,
            batch_size=batch_size,
            label_mode="int",
            shuffle=False,
        )
    else:
        print("No dataset/test folder found; using validation split for final evaluation.")
        test_ds = val_ds

    train_ds = _prepare_dataset(train_ds, cache=cache, shuffle=False)
    val_ds = _prepare_dataset(val_ds, cache=cache, shuffle=False)
    test_ds = _prepare_dataset(test_ds, cache=cache, shuffle=False)
    return train_ds, val_ds, test_ds, class_names


def build_model(backbone: str, num_classes: int, img_size: Tuple[int, int]) -> Tuple[keras.Model, keras.Model]:
    """Create a transfer-learning classifier for the selected CNN backbone."""
    key = canonical_backbone(backbone)
    backbone_factory = SUPPORTED_BACKBONES[key]["factory"]

    inputs = keras.Input(shape=(*img_size, 3), name="image")
    x = layers.RandomFlip("horizontal")(inputs)
    x = layers.RandomRotation(0.08)(x)
    x = layers.RandomZoom(0.1)(x)

    base_model = backbone_factory(
        include_top=False,
        weights="imagenet",
        input_shape=(*img_size, 3),
    )
    base_model.trainable = False

    x = base_model(x, training=False)
    x = layers.GlobalAveragePooling2D()(x)
    x = layers.BatchNormalization()(x)
    x = layers.Dropout(0.35)(x)
    x = layers.Dense(256, activation="relu")(x)
    x = layers.Dropout(0.3)(x)
    outputs = layers.Dense(num_classes, activation="softmax", name="disease")(x)

    model = keras.Model(inputs=inputs, outputs=outputs, name=f"plant_disease_{key}")
    model.compile(
        optimizer=keras.optimizers.Adam(learning_rate=INITIAL_LR),
        loss="sparse_categorical_crossentropy",
        metrics=["accuracy"],
    )
    return model, base_model


def fine_tune_model(
    model: keras.Model,
    base_model: keras.Model,
    train_ds: tf.data.Dataset,
    val_ds: tf.data.Dataset,
    epochs: int,
) -> Optional[keras.callbacks.History]:
    """Unfreeze the last 20 backbone layers and retrain with a lower learning rate."""
    if epochs <= 0:
        return None

    base_model.trainable = True
    for layer in base_model.layers[:-UNFREEZE_LAST_N_LAYERS]:
        layer.trainable = False
    for layer in base_model.layers[-UNFREEZE_LAST_N_LAYERS:]:
        if isinstance(layer, layers.BatchNormalization):
            layer.trainable = False

    model.compile(
        optimizer=keras.optimizers.Adam(learning_rate=FINE_TUNE_LR),
        loss="sparse_categorical_crossentropy",
        metrics=["accuracy"],
    )
    print(f"Fine-tuning last {UNFREEZE_LAST_N_LAYERS} layers with learning rate {FINE_TUNE_LR}...")
    return model.fit(train_ds, validation_data=val_ds, epochs=epochs, verbose=1)


def _callbacks(backbone: str, model_path: Path) -> List[keras.callbacks.Callback]:
    """Create production-friendly training callbacks."""
    timestamp = datetime.now().strftime("%Y%m%d-%H%M%S")
    tensorboard_dir = LOGS_DIR / f"{backbone}-{timestamp}"
    return [
        keras.callbacks.TensorBoard(log_dir=tensorboard_dir, histogram_freq=1),
        keras.callbacks.ModelCheckpoint(
            filepath=model_path,
            monitor="val_accuracy",
            save_best_only=True,
            save_weights_only=False,
        ),
        keras.callbacks.EarlyStopping(monitor="val_loss", patience=5, restore_best_weights=True),
        keras.callbacks.ReduceLROnPlateau(monitor="val_loss", factor=0.3, patience=2, min_lr=1e-7),
    ]


def _save_backend_aliases(model_path: Path, tflite_path: Path, backbone: str) -> None:
    """Copy default MobileNet artifacts to the backend's existing configured paths."""
    if canonical_backbone(backbone) != "mobilenetv2":
        return
    LEGACY_SAVED_MODELS_DIR.mkdir(parents=True, exist_ok=True)
    shutil.copy2(model_path, LEGACY_SAVED_MODELS_DIR / "plant_disease_mobilenet.h5")
    if tflite_path.exists():
        shutil.copy2(tflite_path, LEGACY_SAVED_MODELS_DIR / "plant_disease_mobilenet.tflite")


def train(args: argparse.Namespace) -> None:
    """Train, fine-tune, evaluate, and export a plant disease classifier."""
    ensure_project_dirs()
    backbone = canonical_backbone(args.backbone)
    img_size = get_backbone_input_size(backbone)
    data_dir = Path(args.data_dir)

    artifact_name = args.model_name or f"plant_disease_{_clean_backbone_name(backbone)}"
    model_path = SAVED_MODELS_DIR / f"{artifact_name}.h5"
    tflite_path = SAVED_MODELS_DIR / f"{artifact_name}.tflite"
    plot_path = PLOTS_DIR / f"{artifact_name}_training_history.png"

    train_ds, val_ds, test_ds, class_names = create_datasets(
        data_dir=data_dir,
        img_size=img_size,
        batch_size=args.batch_size,
        validation_split=args.validation_split,
        seed=args.seed,
        cache=not args.no_cache,
    )
    class_indices: Dict[str, int] = {name: idx for idx, name in enumerate(class_names)}
    save_class_names(class_names, class_indices)

    model, base_model = build_model(backbone, len(class_names), img_size)
    print(f"Training {backbone} on {len(class_names)} classes with input size {img_size}...")
    initial_history = model.fit(
        train_ds,
        validation_data=val_ds,
        epochs=args.epochs,
        callbacks=_callbacks(backbone, model_path),
        verbose=1,
    )
    fine_tune_history = fine_tune_model(model, base_model, train_ds, val_ds, args.fine_tune_epochs)

    model.save(model_path)
    print("Saved Keras model:", model_path)

    saved_tflite = export_tflite(model, tflite_path)
    print("Saved TFLite model:", saved_tflite)
    _save_backend_aliases(model_path, saved_tflite, backbone)

    histories = [initial_history] + ([fine_tune_history] if fine_tune_history else [])
    save_history_plots(histories, plot_path)
    print("Saved training history graph:", plot_path)

    evaluate_and_report(model, test_ds, class_names, PLOTS_DIR)
    print("TensorBoard logs:", LOGS_DIR)


def predict_image(
    image_path: str | Path,
    model_path: str | Path = SAVED_MODELS_DIR / "plant_disease_mobilenet.h5",
    labels_path: str | Path | None = None,
    data_dir: str | Path | None = DATASET_DIR,
) -> Tuple[str, float]:
    """Load a saved .h5 model and predict the disease class for one image."""
    model_file = Path(model_path)
    if not model_file.exists():
        raise FileNotFoundError(f"Missing model file: {model_file}. Train first with `python main.py train`.")

    model = keras.models.load_model(model_file)
    class_names = load_class_names(labels_path=labels_path, data_dir=data_dir)
    img_size = get_model_input_size(model)

    img = load_and_resize(image_path, img_size)
    img = normalize(img)
    preds = model.predict(img, verbose=0)[0]
    class_index = int(np.argmax(preds))
    confidence = float(preds[class_index])

    if class_index >= len(class_names):
        class_name = f"Class_{class_index}"
    else:
        class_name = class_names[class_index]

    print("Predicted class:", class_name)
    print(f"Confidence score: {confidence:.4f}")
    return class_name, confidence


def predict(args: argparse.Namespace) -> None:
    """CLI wrapper for single-image prediction with robust error messages."""
    ensure_project_dirs()
    predict_image(
        image_path=args.image_path,
        model_path=args.model_path,
        labels_path=args.labels_path,
        data_dir=args.data_dir,
    )


def parse_args(argv: Optional[Sequence[str]] = None) -> argparse.Namespace:
    """Parse train and predict subcommands."""
    parser = argparse.ArgumentParser(description="Plant disease TensorFlow training and prediction pipeline")
    subparsers = parser.add_subparsers(dest="command", required=True)

    train_parser = subparsers.add_parser("train", help="Train and export a disease detection model")
    train_parser.add_argument("--data-dir", default=str(DATASET_DIR), help="Dataset root with class folders or train/test splits")
    train_parser.add_argument("--backbone", default="mobilenetv2", choices=sorted(SUPPORTED_BACKBONES))
    train_parser.add_argument("--epochs", type=int, default=DEFAULT_EPOCHS)
    train_parser.add_argument("--fine-tune-epochs", type=int, default=DEFAULT_FINE_TUNE_EPOCHS)
    train_parser.add_argument("--batch-size", type=int, default=DEFAULT_BATCH_SIZE)
    train_parser.add_argument("--validation-split", type=float, default=0.2)
    train_parser.add_argument("--seed", type=int, default=42)
    train_parser.add_argument("--model-name", default="", help="Artifact base name without extension")
    train_parser.add_argument("--no-cache", action="store_true", help="Disable tf.data cache() for very large datasets")
    train_parser.set_defaults(func=train)

    predict_parser = subparsers.add_parser("predict", help="Predict one image using a saved .h5 model")
    predict_parser.add_argument("image_path", help="Path to a JPG/PNG leaf image")
    predict_parser.add_argument("--model-path", default=str(SAVED_MODELS_DIR / "plant_disease_mobilenet.h5"))
    predict_parser.add_argument("--labels-path", default=None)
    predict_parser.add_argument("--data-dir", default=str(DATASET_DIR))
    predict_parser.set_defaults(func=predict)

    return parser.parse_args(argv)


def main() -> None:
    """Run the selected CLI command."""
    try:
        args = parse_args()
        args.func(args)
    except (FileNotFoundError, ValueError, tf.errors.InvalidArgumentError) as exc:
        raise SystemExit(f"Error: {exc}") from exc


if __name__ == "__main__":
    main()
