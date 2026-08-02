"""Shared fixtures for the browser tests.

These drive the real app in a real browser: Janet compiles to WASM, the audio graph
gets built, and live loops schedule notes. So the interesting failures are runtime
ones -- a JS exception in audio.ts, or a Janet error surfacing in the output channel --
which is what `page_errors` and `assert_clean` are for.
"""

import pytest

# Trane needs a user gesture before it will start an AudioContext, and some
# instruments (line_in, the sampler's record button) call getUserMedia. Without these
# the browser either refuses to start audio or blocks on a permission prompt.
CHROMIUM_ARGS = [
    "--autoplay-policy=no-user-gesture-required",
    "--use-fake-ui-for-media-stream",
    "--use-fake-device-for-media-stream",
]

FIREFOX_PREFS = {
    "media.autoplay.default": 0,
    "media.navigator.permission.disabled": True,
    "media.navigator.streams.fake": True,
}


def pytest_addoption(parser):
    parser.addoption(
        "--play-seconds",
        action="store",
        default=6.0,
        type=float,
        help="How long to let each track play before checking for errors. "
        "Loops reschedule every 4 beats, so this wants to be a few beats.",
    )


@pytest.fixture(scope="session")
def play_seconds(pytestconfig):
    return pytestconfig.getoption("--play-seconds")


@pytest.fixture(scope="session")
def browser_type_launch_args(browser_type_launch_args, browser_name, pytestconfig):
    if browser_name == "chromium":
        args = list(browser_type_launch_args.get("args", [])) + CHROMIUM_ARGS
        # If you asked for --headed you are watching it, and for this app that means
        # listening to it too. A background run stays silent.
        if not pytestconfig.getoption("--headed"):
            args.append("--mute-audio")
        return {**browser_type_launch_args, "args": args}
    if browser_name == "firefox":
        prefs = {**browser_type_launch_args.get("firefox_user_prefs", {}), **FIREFOX_PREFS}
        return {**browser_type_launch_args, "firefox_user_prefs": prefs}
    return browser_type_launch_args


@pytest.fixture(scope="session")
def browser_context_args(browser_context_args):
    return {**browser_context_args, "permissions": ["microphone"]}


# Headed Chrome asks for a favicon the app doesn't ship; headless doesn't bother.
# Not a real failure, and it would make the suite pass or fail depending on --headed.
IGNORED_PATHS = ("/favicon.ico",)


@pytest.fixture
def page_errors(page, base_url):
    """Collects the failures a DOM assertion can't see.

    The old Selenium suite only looked for a .janet-err element, so a thrown
    TypeError in the audio layer passed silently. console.warn is deliberately NOT
    collected: loop_manager warns about negative sleep times and wire.ts warns about
    unconnectable nodes during normal operation.
    """
    errors: list[str] = []

    def on_console(msg):
        if msg.type != "error":
            return
        # Chrome logs a bare "Failed to load resource: ... 404" with no URL in it,
        # which is useless to debug from. on_response reports those with the URL.
        if msg.text.startswith("Failed to load resource"):
            return
        errors.append(f"console.error: {msg.text}")

    def on_response(response):
        # Only our own responses. Tracks fetch impulses and samples from third-party
        # hosts, and a flaky CDN is not a regression in trane.
        if not response.url.startswith(base_url):
            return
        if any(response.url.endswith(path) for path in IGNORED_PATHS):
            return
        if response.status >= 400:
            errors.append(f"HTTP {response.status}: {response.url}")

    page.on("pageerror", lambda exc: errors.append(f"pageerror: {exc}"))
    page.on("console", on_console)
    page.on("response", on_response)
    return errors
