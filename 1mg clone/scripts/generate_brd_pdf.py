"""Render the maintained BRD Markdown file as a shareable PDF."""

from html import escape
from pathlib import Path
import re
import sys

from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import cm
from reportlab.platypus import Paragraph, SimpleDocTemplate, Spacer, Table, TableStyle


def inline(value: str) -> str:
    value = escape(value)
    value = re.sub(r"`([^`]+)`", r"<font name='Courier'>\1</font>", value)
    return value.replace("**", "")


def build_pdf(source: Path, destination: Path) -> None:
    styles = getSampleStyleSheet()
    styles.add(ParagraphStyle(name="TitleCenter", parent=styles["Title"], alignment=TA_CENTER, spaceAfter=20))
    styles.add(ParagraphStyle(name="H1", parent=styles["Heading1"], textColor=colors.HexColor("#d94536"), spaceBefore=16, spaceAfter=8))
    styles.add(ParagraphStyle(name="H2", parent=styles["Heading2"], textColor=colors.HexColor("#333333"), spaceBefore=12, spaceAfter=6))
    styles.add(ParagraphStyle(name="Body", parent=styles["BodyText"], leading=15, spaceAfter=7))
    styles.add(ParagraphStyle(name="AppBullet", parent=styles["BodyText"], leftIndent=14, firstLineIndent=-10, leading=15, spaceAfter=4))

    story = []
    table_rows = []

    def flush_table() -> None:
        nonlocal table_rows
        if not table_rows:
            return
        table = Table(table_rows, colWidths=[5.1 * cm, 10.9 * cm], repeatRows=1)
        table.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#d94536")),
            ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
            ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
            ("BACKGROUND", (0, 1), (-1, -1), colors.HexColor("#fff7f5")),
            ("GRID", (0, 0), (-1, -1), 0.35, colors.HexColor("#dddddd")),
            ("VALIGN", (0, 0), (-1, -1), "TOP"),
            ("LEFTPADDING", (0, 0), (-1, -1), 6),
            ("RIGHTPADDING", (0, 0), (-1, -1), 6),
            ("TOPPADDING", (0, 0), (-1, -1), 6),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
        ]))
        story.extend([table, Spacer(1, 10)])
        table_rows = []

    for raw_line in source.read_text(encoding="utf-8").splitlines():
        line = raw_line.strip()
        if line.startswith("|") and line.endswith("|"):
            cells = [cell.strip() for cell in line.strip("|").split("|")]
            if all(re.fullmatch(r"[- :]+", cell) for cell in cells):
                continue
            table_rows.append([Paragraph(inline(cell), styles["Body"]) for cell in cells])
            continue
        flush_table()
        if not line:
            story.append(Spacer(1, 4))
        elif line.startswith("# "):
            story.append(Paragraph(inline(line[2:]), styles["TitleCenter"]))
        elif line.startswith("## "):
            story.append(Paragraph(inline(line[3:]), styles["H1"]))
        elif line.startswith("### "):
            story.append(Paragraph(inline(line[4:]), styles["H2"]))
        elif line.startswith("- "):
            story.append(Paragraph("&bull; " + inline(line[2:]), styles["AppBullet"]))
        elif re.match(r"\d+\. ", line):
            number, content = line.split(". ", 1)
            story.append(Paragraph(f"{number}. {inline(content)}", styles["Body"]))
        else:
            story.append(Paragraph(inline(line), styles["Body"]))
    flush_table()

    document = SimpleDocTemplate(
        str(destination), pagesize=A4, rightMargin=1.7 * cm, leftMargin=1.7 * cm,
        topMargin=1.6 * cm, bottomMargin=1.6 * cm, title="1mg Business Requirements Document",
        author="1mg project team",
    )
    document.build(story)


if __name__ == "__main__":
    root = Path(__file__).resolve().parents[1]
    source_file = root / "docs" / "BUSINESS_REQUIREMENTS_DOCUMENT.md"
    output_file = Path(sys.argv[1]) if len(sys.argv) > 1 else root / "docs" / "BUSINESS_REQUIREMENTS_DOCUMENT_UPDATED.pdf"
    output_file.parent.mkdir(parents=True, exist_ok=True)
    build_pdf(source_file, output_file)
    print(output_file)
