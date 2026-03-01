"""
Plant Disease CNN Training - Transfer Learning (MobileNetV2 / ResNet50)
PlantVillage dataset. Run from repo root: python model/train.py
"""
import json
import os
import argparse
from pathlib import Path

import numpy as np
import tensorflow as tf
from tensorflow import keras
from tensorflow.keras import layers
from tensorflow.keras.preprocessing.image import ImageDataGenerator
from tensorflow.keras.applications import MobileNetV2, ResNet50
from tensorflow.keras.models import Model

# Default paths (relative to repo root)
REPO_ROOT = Path(__file__).resolve().parent.parent
DEFAULT_DATA_DIR = REPO_ROOT / "Kaggle code with dataset" / "plantvillage"  # or set PLANTVILLAGE path
SAVED_MODELS = REPO_ROOT / "model" / "saved_models"
LABELS_DIR = REPO_ROOT / "model" / "labels"
IMG_SIZE = (224, 224)
BATCH_SIZE = 32
EPOCHS = 15
INIT_LR = 1e-4


def get_data_generators(data_dir: Path, batch_size: int = BATCH_SIZE):
    """Build train/val generators with augmentation."""
    train_datagen = ImageDataGenerator(
        rescale=1.0 / 255,
        rotation_range=25,
        width_shift_range=0.1,
        height_shift_range=0.1,
        shear_range=0.2,
        zoom_range=0.2,
        horizontal_flip=True,
        fill_mode="nearest",
        validation_split=0.2,
    )
    train_generator = train_datagen.flow_from_directory(
        data_dir,
        target_size=IMG_SIZE,
        batch_size=batch_size,
        class_mode="categorical",
        subset="training",
        shuffle=True,
    )
    val_generator = train_datagen.flow_from_directory(
        data_dir,
        target_size=IMG_SIZE,
        batch_size=batch_size,
        class_mode="categorical",
        subset="validation",
        shuffle=False,
    )
    return train_generator, val_generator


def build_model(backbone: str = "mobilenetv2", num_classes: int = 15):
    """Transfer learning: frozen base + trainable head."""
    if backbone == "resnet50":
        base = ResNet50(weights="imagenet", include_top=False, input_shape=(*IMG_SIZE, 3))
    else:
        base = MobileNetV2(weights="imagenet", include_top=False, input_shape=(*IMG_SIZE, 3))
    base.trainable = False
    x = base.output
    x = layers.GlobalAveragePooling2D()(x)
    x = layers.Dense(256, activation="relu")(x)
    x = layers.Dropout(0.5)(x)
    out = layers.Dense(num_classes, activation="softmax")(x)
    model = Model(inputs=base.input, outputs=out)
    model.compile(
        optimizer=keras.optimizers.Adam(learning_rate=INIT_LR),
        loss="categorical_crossentropy",
        metrics=["accuracy"],
    )
    return model


def fine_tune(model: Model, train_gen, val_gen, epochs_finetune: int = 5):
    """Unfreeze top layers and train with low LR."""
    model.trainable = True
    for layer in model.layers[:-10]:
        layer.trainable = False
    model.compile(
        optimizer=keras.optimizers.Adam(learning_rate=1e-5),
        loss="categorical_crossentropy",
        metrics=["accuracy"],
    )
    history = model.fit(
        train_gen,
        validation_data=val_gen,
        epochs=epochs_finetune,
        verbose=1,
    )
    return history


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--data-dir", type=str, default=None, help="Path to PlantVillage folder (e.g. train/ or dataset/)")
    parser.add_argument("--backbone", type=str, default="mobilenetv2", choices=["mobilenetv2", "resnet50"])
    parser.add_argument("--epochs", type=int, default=EPOCHS)
    parser.add_argument("--finetune-epochs", type=int, default=5)
    parser.add_argument("--save-tflite", action="store_true", help="Export TFLite after training")
    args = parser.parse_args()
    data_dir = Path(args.data_dir) if args.data_dir else DEFAULT_DATA_DIR
    if not data_dir.exists():
        # Try flat structure: data_dir/class_name/img.jpg
        alt = REPO_ROOT / "dataset" / "train"
        if alt.exists():
            data_dir = alt
        else:
            raise FileNotFoundError(f"Data dir not found: {data_dir}. Set --data-dir to PlantVillage root.")
    SAVED_MODELS.mkdir(parents=True, exist_ok=True)
    LABELS_DIR.mkdir(parents=True, exist_ok=True)

    train_gen, val_gen = get_data_generators(data_dir)
    num_classes = len(train_gen.class_indices)
    class_names = [k for k in sorted(train_gen.class_indices, key=lambda x: train_gen.class_indices[x])]
    with open(LABELS_DIR / "class_names.json", "w") as f:
        json.dump({"classes": class_names, "indices": train_gen.class_indices}, f, indent=2)

    model = build_model(backbone=args.backbone, num_classes=num_classes)
    print("Training (transfer learning)...")
    history = model.fit(
        train_gen,
        validation_data=val_gen,
        epochs=args.epochs,
        verbose=1,
    )
    if args.finetune_epochs > 0:
        print("Fine-tuning...")
        fine_tune(model, train_gen, val_gen, epochs_finetune=args.finetune_epochs)

    model_path = SAVED_MODELS / f"plant_disease_{args.backbone}.h5"
    model.save(model_path)
    print(f"Saved model: {model_path}")

    if args.save_tflite:
        converter = tf.lite.TFLiteConverter.from_keras_model(model)
        converter.optimizations = [tf.lite.Optimize.DEFAULT]
        tflite_model = converter.convert()
        tflite_path = SAVED_MODELS / f"plant_disease_{args.backbone}.tflite"
        with open(tflite_path, "wb") as f:
            f.write(tflite_model)
        print(f"Saved TFLite: {tflite_path}")

    # Plot metrics
    try:
        import matplotlib
        matplotlib.use("Agg")
        import matplotlib.pyplot as plt
        plt.figure(figsize=(12, 4))
        plt.subplot(1, 2, 1)
        plt.plot(history.history["accuracy"], label="Train")
        plt.plot(history.history["val_accuracy"], label="Val")
        plt.title("Accuracy")
        plt.legend()
        plt.subplot(1, 2, 2)
        plt.plot(history.history["loss"], label="Train")
        plt.plot(history.history["val_loss"], label="Val")
        plt.title("Loss")
        plt.legend()
        plt.savefig(SAVED_MODELS / "training_metrics.png", dpi=150)
        print("Saved training_metrics.png")
    except Exception as e:
        print("Could not save plots:", e)


if __name__ == "__main__":
    main()
