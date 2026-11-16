import tempfile
import unittest
from pathlib import Path

from check_site import check_site


class CheckSiteTests(unittest.TestCase):
    def setUp(self):
        self.temp_dir = tempfile.TemporaryDirectory()
        self.root = Path(self.temp_dir.name)

    def tearDown(self):
        self.temp_dir.cleanup()

    def write(self, relative_path, content):
        path = self.root / relative_path
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_text(content, encoding="utf-8")
        return path

    def test_accepts_relative_assets_and_directory_indexes(self):
        self.write("index.html", """<!doctype html><html lang="de"><head>
        <meta name="viewport" content="width=device-width, initial-scale=1"></head>
        <body><a href="lesson/">Open</a><picture><source srcset="img/diagram.webp 1x" type="image/webp">
        <img src="img/diagram.svg" alt="Diagram"></picture></body></html>""")
        self.write("lesson/index.html", '<html lang="de"><meta name="viewport" content="width=device-width">')
        self.write("img/diagram.svg", "<svg></svg>")
        self.write("img/diagram.webp", "webp")
        self.write("styles/site.css", ".hero { background-image: url('../img/diagram.svg'); }")

        errors, page_count = check_site(self.root)

        self.assertEqual(errors, [])
        self.assertEqual(page_count, 2)

    def test_reports_missing_assets_and_case_mismatches(self):
        self.write("index.html", """<html lang="de"><meta name="viewport" content="width=device-width">
        <a href="Lesson/index.html">Lesson</a><img src="missing.svg" alt="Missing"></html>""")
        self.write("lesson/index.html", '<html lang="de"><meta name="viewport" content="width=device-width">')

        errors, _ = check_site(self.root)

        self.assertEqual(len(errors), 2)
        self.assertTrue(any("Lesson/index.html" in error for error in errors))
        self.assertTrue(any("missing.svg" in error for error in errors))

    def test_reports_missing_picture_sources_and_css_assets(self):
        self.write("index.html", """<html lang="de"><meta name="viewport" content="width=device-width">
        <picture><source srcset="missing.webp" type="image/webp"><img src="fallback.png" alt="Image"></picture>
        <link rel="stylesheet" href="styles/site.css"></html>""")
        self.write("fallback.png", "fallback")
        self.write("styles/site.css", ".hero { background: url('../missing-background.png'); }")

        errors, _ = check_site(self.root)

        self.assertTrue(any("missing.webp" in error for error in errors))
        self.assertTrue(any("missing-background.png" in error for error in errors))

    def test_requires_language_viewport_and_image_alt_on_learning_pages(self):
        self.write("index.html", '<html><img src="diagram.svg"></html>')
        self.write("diagram.svg", "<svg></svg>")

        errors, _ = check_site(self.root)

        self.assertTrue(any("lang attribute" in error for error in errors))
        self.assertTrue(any("viewport" in error for error in errors))
        self.assertTrue(any("alt attribute" in error for error in errors))

    def test_allows_test_fixtures_without_viewport(self):
        self.write("tests/browser.html", '<html lang="de"><body>Test fixture</body></html>')

        errors, _ = check_site(self.root)

        self.assertEqual(errors, [])


if __name__ == "__main__":
    unittest.main()
