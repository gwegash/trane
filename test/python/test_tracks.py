"""Loads each example track in a browser, runs it, and checks nothing blew up.

Replaces the old Selenium suite. Three things changed beyond the framework:

  * the code is actually evaluated. The old `execute_code` clicked a line in the
    editor but never sent Alt+Enter, so tracks only ran because `npm run dev` builds
    with DEV=true, which auto-calls onCodeReload(). Against a production bundle it
    tested nothing.
  * failures fail. The old error check ran in fixture teardown and its except branch
    was `assert True`.
  * the tracks are parametrized rather than copy-pasted, which is how the old file
    ended up defining test_keyboards twice -- the second shadowed the first, so the
    keyboards track never ran at all.
"""

import re
import time

import pytest
from playwright.sync_api import Page, expect

TRACKS = [
    "acid",
    "bach",
    "etude",
    "gypsy_woman",
    "jungle",
    "keyboards",
    "parameter_changing",
    "scales_chords",
    "wiring",
]

# main() only runs after a click on #intro -- the gesture that lets us open an
# AudioContext. Everything else waits on that.
INTRO = "#intro"
EDITOR = ".cm-content"
JANET_ERR = ".janet-err"


def boot(page: Page, url: str) -> None:
    page.goto(url)
    page.click(INTRO)
    page.wait_for_selector(EDITOR)


def evaluate_track(page: Page) -> None:
    """Presses Alt+Enter, the binding index.ts registers for onCodeReload."""
    page.click(EDITOR)
    page.keyboard.press("Alt+Enter")
    # newInstrumentMappings sets window.instruments once the graph is built
    page.wait_for_function(
        "() => window.instruments && window.instruments.filter(Boolean).length > 0",
        timeout=20_000,
    )


def assert_clean(page: Page, errors: list[str]) -> None:
    expect(page.locator(JANET_ERR)).to_have_count(0)
    assert errors == [], "browser reported errors:\n" + "\n".join(errors)


@pytest.mark.parametrize("track", TRACKS)
def test_track_plays(page: Page, page_errors, play_seconds, base_url, track):
    path = f"tracks/{track}.janet"
    boot(page, f"/?t={path}")

    # editor.ts fetches the track but never checks response.ok, so a missing file
    # would put the 404 body in the editor and everything downstream would "pass".
    served = page.request.get(f"{base_url}/{path}")
    assert served.ok, f"{path} did not serve: {served.status}"
    loaded = page.evaluate("() => window.editor.state.doc.toString()")
    assert loaded.strip() == served.text().strip(), (
        f"editor content does not match {path} -- did it fall back to the default script?"
    )

    evaluate_track(page)

    graph = page.evaluate("() => window.instruments.filter(Boolean).length")
    assert graph > 0, "no instruments were instantiated"

    time.sleep(play_seconds)  # let the live loops reschedule a few times
    assert_clean(page, page_errors)


def test_knob_writes_value_back_to_the_buffer(page: Page, page_errors):
    """Shift-clicking a knob's label writes its current value into the source.

    etude declares `(gain :hello-gain)` with no :gain argument, so the first click
    exercises the insert path and the second the replace path. The second click is
    the interesting one: a bug there appends a duplicate pair rather than updating
    the existing one, and it compounds on every click.
    """
    boot(page, "/?t=tracks/etude.janet")
    evaluate_track(page)

    doc = lambda: page.evaluate("() => window.editor.state.doc.toString()")
    assert "(gain :hello-gain)" in doc(), "etude no longer declares the bare gain"

    label = page.locator(".instrument").filter(has_text=":hello-gain").locator(
        "p.heading", has_text="gain"
    )
    label.click(modifiers=["Shift"])

    written = re.search(r"\(gain :hello-gain[^)]*\)", doc())
    assert written, "the gain declaration went missing"
    assert re.search(r":gain [\d.]+", written.group()), (
        f"expected a :gain value to be inserted, got {written.group()!r}"
    )

    label.click(modifiers=["Shift"])

    rewritten = re.search(r"\(gain :hello-gain[^)]*\)", doc()).group()
    assert len(re.findall(r":gain [\d.]+", rewritten)) == 1, (
        f"second write should replace, not append: {rewritten!r}"
    )

    assert_clean(page, page_errors)


def test_tutor_types_and_runs(page: Page, page_errors, play_seconds):
    """The ?tutor flow animates code into the editor rather than loading a track."""
    boot(page, "/?tutor")

    page.wait_for_function(
        "() => window.editor && window.editor.state.doc.length > 40",
        timeout=30_000,
    )
    evaluate_track(page)

    time.sleep(play_seconds)
    assert_clean(page, page_errors)
