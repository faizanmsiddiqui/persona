from pathlib import Path

from jinja2 import Environment, FileSystemLoader, select_autoescape
from weasyprint import HTML

TEMPLATES = Path(__file__).parent / "templates"
environment = Environment(loader=FileSystemLoader(TEMPLATES), autoescape=False)

def render_html(document: dict) -> str:
    css = (TEMPLATES / "resume.css").read_text(encoding="utf-8")
    return environment.get_template("resume.html").render(css=css, accent=document["presentation"]["accent"], basics=document["basics"], sections=sorted((s for s in document["sections"] if s["visible"]), key=lambda s: s["order"]))

def render_pdf(document: dict) -> bytes:
    return HTML(string=render_html(document), base_url=str(TEMPLATES)).write_pdf()
