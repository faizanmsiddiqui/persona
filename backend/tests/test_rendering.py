from app.rendering import render_html

def test_rendering_escapes_user_content() -> None:
    document = {"presentation":{"accent":"#176b5b"},"basics":{"name":"<script>alert(1)</script>","headline":"","email":None,"phone":"","summary":""},"sections":[]}
    html = render_html(document)
    assert "<script>" not in html
    assert "&lt;script&gt;" in html
