"""Collapse redundant blank paragraphs in a DOCX without changing its content."""

from pathlib import Path
from shutil import copyfile
from tempfile import NamedTemporaryFile
from xml.etree import ElementTree as ET
from zipfile import ZIP_DEFLATED, ZipFile
import sys


W = "http://schemas.openxmlformats.org/wordprocessingml/2006/main"
NS = {"w": W}
ET.register_namespace("w", W)


def is_removable_blank(paragraph: ET.Element) -> bool:
    text = "".join(node.text or "" for node in paragraph.findall(".//w:t", NS)).strip()
    if text:
        return False
    # Keep paragraphs that carry visual/document structure rather than text.
    return not any(paragraph.findall(path, NS) for path in (".//w:drawing", ".//w:br", ".//w:tab", ".//w:fldChar"))


def clean(source: Path, destination: Path) -> int:
    with ZipFile(source, "r") as archive:
        root = ET.fromstring(archive.read("word/document.xml"))
        removed = 0
        # Retain one blank paragraph between blocks; remove only additional,
        # consecutive blank paragraphs that create oversized gaps.
        for parent in root.iter():
            previous_child_was_blank = False
            for child in list(parent):
                is_blank_paragraph = child.tag == f"{{{W}}}p" and is_removable_blank(child)
                if is_blank_paragraph and previous_child_was_blank:
                    parent.remove(child)
                    removed += 1
                    continue
                previous_child_was_blank = is_blank_paragraph

        with NamedTemporaryFile(delete=False, suffix=".docx") as temporary:
            temporary_path = Path(temporary.name)
        try:
            with ZipFile(temporary_path, "w", ZIP_DEFLATED) as output:
                for item in archive.infolist():
                    content = ET.tostring(root, encoding="utf-8", xml_declaration=True) if item.filename == "word/document.xml" else archive.read(item.filename)
                    output.writestr(item, content)
            destination.parent.mkdir(parents=True, exist_ok=True)
            copyfile(temporary_path, destination)
        finally:
            temporary_path.unlink(missing_ok=True)
    return removed


if __name__ == "__main__":
    if len(sys.argv) != 3:
        raise SystemExit("Usage: clean_docx_whitespace.py SOURCE.docx DESTINATION.docx")
    count = clean(Path(sys.argv[1]), Path(sys.argv[2]))
    print(f"Removed {count} redundant blank paragraphs.")
