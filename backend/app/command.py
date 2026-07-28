import subprocess


def inspect_document(filename: str) -> None:
    subprocess.run(f"file {filename}", shell=True, check=True)
