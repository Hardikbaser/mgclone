"""Render the project viva guide with correctly sized tables and vector diagrams."""
from html import escape
from pathlib import Path
import re
from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import cm
from reportlab.platypus import Flowable, Paragraph, SimpleDocTemplate, Spacer, Table, TableStyle

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "docs" / "PROJECT_VIVA_GUIDE.md"
OUTPUT = ROOT / "docs" / "PROJECT_VIVA_GUIDE.pdf"
INK, MUTED, CORAL = colors.HexColor("#202124"), colors.HexColor("#5f6368"), colors.HexColor("#d94f43")
PALE, GREEN, BLUE, LINE = colors.HexColor("#fff4f1"), colors.HexColor("#e8f3eb"), colors.HexColor("#e9f0fb"), colors.HexColor("#d9d9d9")

def text(value):
    return escape(value).replace("**", "")

class Diagram(Flowable):
    width, height = 17.0 * cm, 8.0 * cm
    def __init__(self, kind):
        super().__init__()
        self.kind = kind
    def box(self, c, x, y, w, h, title, detail, fill):
        c.setFillColor(fill); c.setStrokeColor(colors.HexColor("#ababab")); c.roundRect(x, y, w, h, 7, 1, 1)
        c.setFillColor(INK); c.setFont("Helvetica-Bold", 9); c.drawCentredString(x + w / 2, y + h - 16, title)
        c.setFillColor(MUTED); c.setFont("Helvetica", 7)
        for i, line in enumerate(detail.split("\n")): c.drawCentredString(x + w / 2, y + h - 29 - i * 9, line)
    def arrow(self, c, x1, y1, x2, y2, label=""):
        c.setStrokeColor(CORAL); c.setFillColor(CORAL); c.setLineWidth(1.2); c.line(x1, y1, x2, y2); c.circle(x2, y2, 2.2, 0, 1)
        if label: c.setFillColor(MUTED); c.setFont("Helvetica", 6.7); c.drawCentredString((x1+x2)/2, (y1+y2)/2+5, label)
    def draw(self):
        c = self.canv; c.saveState()
        if self.kind == "architecture":
            self.box(c, 4,105,105,49,"Browser","React pages\nZustand state",BLUE)
            self.box(c,137,105,105,49,"Next.js","App Router\ncomponents + assets",PALE)
            self.box(c,270,105,105,49,"Express API","routes\ncontrollers + auth",GREEN)
            self.box(c,403,133,105,49,"PostgreSQL","Product catalogue\nSQL queries",colors.HexColor("#eef0f8"))
            self.box(c,403,65,105,49,"PostgreSQL","Users, cart, orders\naddresses",colors.HexColor("#eef0f8"))
            self.box(c,270,35,105,42,"External services","SMTP · Razorpay · Jitsi",colors.HexColor("#f7ecf1"))
            self.arrow(c,109,129,137,129,"UI"); self.arrow(c,242,129,270,129,"HTTPS /api")
            self.arrow(c,375,145,403,157,"products"); self.arrow(c,375,112,403,89,"user data"); self.arrow(c,322,105,322,77,"integrations")
            note = "The browser sends credentials-included requests; Express is the only layer that accesses databases."
        else:
            self.box(c,4,105,104,49,"Customer","searches, logs in,\nchanges cart",BLUE)
            self.box(c,137,105,115,49,"Product / Cart UI","ProductsPage\nuseCartStore",PALE)
            self.box(c,281,105,111,49,"Express API","products, auth,\ncart, orders",GREEN)
            self.box(c,421,125,90,42,"PostgreSQL","Products",colors.HexColor("#eef0f8"))
            self.box(c,421,65,90,42,"PostgreSQL","User cart\norders",colors.HexColor("#eef0f8"))
            self.box(c,137,35,115,42,"Checkout UI","address + payment\nconfirmation",PALE)
            self.box(c,281,35,111,42,"Payment API","Razorpay order\nHMAC verify",GREEN)
            self.box(c,421,20,90,42,"Razorpay","Checkout",colors.HexColor("#f7ecf1"))
            self.arrow(c,108,129,137,129,"actions"); self.arrow(c,252,129,281,129,"JSON")
            self.arrow(c,392,145,421,146,"read"); self.arrow(c,392,111,421,86,"write/read")
            self.arrow(c,194,105,194,77,"checkout"); self.arrow(c,252,56,281,56,"amount"); self.arrow(c,392,56,421,42,"payment")
            note = "Level 1 DFD: customer data flows through the API, and writes remain tied to authenticated user identity."
        c.setFillColor(MUTED); c.setFont("Helvetica-Oblique", 7.3); c.drawString(4,12,note); c.restoreState()

def make_styles():
    base = getSampleStyleSheet()
    return {
        "title": ParagraphStyle("title", parent=base["Title"], alignment=TA_CENTER, textColor=INK, fontSize=24, leading=29, spaceAfter=18),
        "h1": ParagraphStyle("h1", parent=base["Heading1"], textColor=CORAL, fontSize=16, leading=20, spaceBefore=16, spaceAfter=8),
        "h2": ParagraphStyle("h2", parent=base["Heading2"], textColor=INK, fontSize=12.5, leading=16, spaceBefore=10, spaceAfter=6),
        "body": ParagraphStyle("body", parent=base["BodyText"], textColor=INK, fontSize=9.1, leading=13.4, spaceAfter=6),
        "bullet": ParagraphStyle("bullet", parent=base["BodyText"], textColor=INK, fontSize=9.1, leading=13.2, leftIndent=15, firstLineIndent=-10, spaceAfter=3),
        "caption": ParagraphStyle("caption", parent=base["BodyText"], textColor=MUTED, alignment=TA_CENTER, fontSize=8, leading=10, spaceAfter=10),
    }

def make_table(rows, s):
    count = max(len(row) for row in rows)
    widths = [4.5*cm,12.5*cm] if count == 2 else ([3.6*cm,4.2*cm,9.2*cm] if count == 3 else [17.0*cm/count]*count)
    content = [[Paragraph(text(cell),s["body"]) for cell in row + [""]*(count-len(row))] for row in rows]
    table = Table(content,colWidths=widths,repeatRows=1,hAlign="LEFT")
    table.setStyle(TableStyle([("BACKGROUND",(0,0),(-1,0),CORAL),("TEXTCOLOR",(0,0),(-1,0),colors.white),("FONTNAME",(0,0),(-1,0),"Helvetica-Bold"),("ROWBACKGROUNDS",(0,1),(-1,-1),[colors.white,PALE]),("GRID",(0,0),(-1,-1),.35,LINE),("VALIGN",(0,0),(-1,-1),"TOP"),("LEFTPADDING",(0,0),(-1,-1),6),("RIGHTPADDING",(0,0),(-1,-1),6),("TOPPADDING",(0,0),(-1,-1),5),("BOTTOMPADDING",(0,0),(-1,-1),5)]))
    return [table,Spacer(1,8)]

def header_footer(c, doc):
    c.saveState(); c.setStrokeColor(LINE); c.line(doc.leftMargin,A4[1]-1.25*cm,A4[0]-doc.rightMargin,A4[1]-1.25*cm)
    c.setFillColor(MUTED); c.setFont("Helvetica",7.5); c.drawString(doc.leftMargin,A4[1]-.88*cm,"1mg Clone — Project Viva Guide")
    c.drawRightString(A4[0]-doc.rightMargin,.8*cm,f"Page {doc.page}"); c.restoreState()

def build():
    s, story, table_rows = make_styles(), [], []
    def flush():
        nonlocal table_rows
        if table_rows: story.extend(make_table(table_rows,s)); table_rows=[]
    for raw in SOURCE.read_text(encoding="utf-8").splitlines():
        line = raw.strip()
        if line.startswith("|") and line.endswith("|"):
            cells=[x.strip() for x in line.strip("|").split("|")]
            if not all(re.fullmatch("[- :]+",x) for x in cells): table_rows.append(cells)
            continue
        flush()
        if not line: story.append(Spacer(1,3))
        elif line.startswith("# "): story.extend([Paragraph(text(line[2:]),s["title"]),Paragraph("Architecture, data flows, implementation notes, and viva preparation",s["caption"])])
        elif line.startswith("## "):
            heading=line[3:]; story.append(Paragraph(text(heading),s["h1"]))
            if heading == "Architecture and request flow": story.extend([Diagram("architecture"),Spacer(1,8),Paragraph("Level 1 data-flow diagram",s["h2"]),Diagram("dfd"),Spacer(1,8)])
        elif line.startswith("### "): story.append(Paragraph(text(line[4:]),s["h2"]))
        elif line.startswith("- "): story.append(Paragraph("&bull; "+text(line[2:]),s["bullet"]))
        elif re.match("[0-9]+\\. ",line):
            n, body=line.split(". ",1); story.append(Paragraph(f"<b>{n}.</b> {text(body)}",s["body"]))
        else: story.append(Paragraph(text(line),s["body"]))
    flush()
    SimpleDocTemplate(str(OUTPUT),pagesize=A4,leftMargin=1.65*cm,rightMargin=1.65*cm,topMargin=1.65*cm,bottomMargin=1.35*cm,title="1mg Clone Project Viva Guide").build(story,onFirstPage=header_footer,onLaterPages=header_footer)
    print(OUTPUT)
if __name__ == "__main__": build()
