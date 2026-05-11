"""Backward-compatible entry point for the root ML CLI.

Prefer:
    python main.py train
    python main.py predict path/to/image.jpg
"""

from pathlib import Path
import sys


REPO_ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(REPO_ROOT))

from main import main  # noqa: E402


if __name__ == "__main__":
    if len(sys.argv) == 1 or sys.argv[1] not in {"train", "predict", "-h", "--help"}:
        sys.argv.insert(1, "train")
    sys.argv = [arg.replace("--finetune-epochs", "--fine-tune-epochs") for arg in sys.argv]
    if "--save-tflite" in sys.argv:
        sys.argv.remove("--save-tflite")
    main()
