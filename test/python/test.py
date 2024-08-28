import time
from selenium import webdriver
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.common.by import By
from selenium.common import NoSuchElementException, ElementNotInteractableException
from selenium.webdriver.support.wait import WebDriverWait
from selenium.webdriver.common.desired_capabilities import DesiredCapabilities

from ipdb import set_trace


import pytest

LOCAL_SERVER = "http://localhost:8000"
BACH_TRACK = "?t=tracks/bach.janet"
JUNGLE_TRACK = "?t=tracks/jungle.janet"
CRYSTAL_TRACK = "?t=tracks/gypsy_woman.janet"
ETUDE_TRACK = "?t=tracks/etude.janet"
KEYBOARD_TRACK = "?t=tracks/keyboards.janet"
TUTOR = "?tutor"

def get_wait(driver):
    errors = [NoSuchElementException, ElementNotInteractableException]
    wait = WebDriverWait(driver, timeout=2, poll_frequency=.2, ignored_exceptions=errors)
    return wait

def execute_code(driver):
    introEl = driver.find_element(By.ID, "intro")
    introEl.click()

    codeEl = driver.find_element(By.CLASS_NAME, "cm-line")

    wait = get_wait(driver)

    wait.until(lambda d : codeEl.click() or True)

def check_janet_logs(driver):
    try:
        errorEl = driver.find_element(By.CLASS_NAME, "janet-err")
        assert not errorEl
    except NoSuchElementException:
        assert True

@pytest.fixture
def setup_driver():
    print("starting driver")

    driver = webdriver.Firefox()
    yield driver

    print("checking janet logs")
    check_janet_logs(driver)
    print("exiting execution")
    driver.quit()

def test_jungle(setup_driver):
    setup_driver.get(LOCAL_SERVER + JUNGLE_TRACK)
    execute_code(setup_driver)
    time.sleep(10)

def test_bach(setup_driver):
    setup_driver.get(LOCAL_SERVER + BACH_TRACK)
    execute_code(setup_driver)
    time.sleep(10)

def test_crystal(setup_driver):
    setup_driver.get(LOCAL_SERVER + CRYSTAL_TRACK)
    execute_code(setup_driver)
    time.sleep(10)

def test_etude(setup_driver):
    setup_driver.get(LOCAL_SERVER + ETUDE_TRACK)
    execute_code(setup_driver)
    time.sleep(10)

def test_keyboards(setup_driver):
    setup_driver.get(LOCAL_SERVER + KEYBOARD_TRACK)
    execute_code(setup_driver)
    time.sleep(15)

def test_keyboards(setup_driver):
    setup_driver.get(LOCAL_SERVER + TUTOR)
    execute_code(setup_driver)
    time.sleep(60)
