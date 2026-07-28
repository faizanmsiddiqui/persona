import bleach

ALLOWED_TAGS = ["p", "br", "strong", "em", "ul", "ol", "li"]

def sanitize_document(document: dict) -> dict:
    clean = dict(document)
    clean["basics"] = dict(clean["basics"])
    clean["basics"]["summary"] = bleach.clean(clean["basics"].get("summary", ""), tags=ALLOWED_TAGS, strip=True)
    for section in clean.get("sections", []):
        for item in section.get("items", []):
            item["description"] = bleach.clean(item.get("description", ""), tags=ALLOWED_TAGS, strip=True)
    return clean
