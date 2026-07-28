from app.rendering import render_html

def test_rendering_escapes_user_content() -> None:
    document = {"presentation":{"accent":"#176b5b"},"basics":{"name":"<script>alert(1)</script>","headline":"","email":None,"phone":"","summary":""},"sections":[]}
    html = render_html(document)
    assert "<script>" not in html
    assert "&lt;script&gt;" in html


def test_rendering_separates_contact_details() -> None:
    document = {
        "presentation": {"accent": "#176b5b"},
        "basics": {
            "name": "Ada Lovelace",
            "headline": "Engineer",
            "email": "ada@example.com",
            "phone": "+44 123",
            "location": "London",
            "summary": "",
        },
        "sections": [],
    }
    html = render_html(document)
    assert "ada@example.com | +44 123 | London" in html
    assert 'font-family: Arial, "Liberation Sans", sans-serif' in html
    assert "&#34;Liberation Sans&#34;" not in html
