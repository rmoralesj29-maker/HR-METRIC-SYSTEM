import time
from playwright.sync_api import sync_playwright

def verify_changes():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        page.set_viewport_size({"width": 1280, "height": 1024})

        try:
            print("Navigating to App...")
            page.goto("http://localhost:3123")
            time.sleep(5)

            # Click Dashboard
            print("Clicking Dashboard tab...")
            page.click("button:has-text('Dashboard')")
            time.sleep(2)
            page.screenshot(path="verification_dashboard_real.png", full_page=True)
            print("Dashboard screenshot taken.")

            # Click Employees
            print("Clicking Employees tab...")
            page.click("button:has-text('Employees')")
            time.sleep(2)
            page.screenshot(path="verification_employees_real.png", full_page=True)
            print("Employees screenshot taken.")

            # Click Edit
            print("Opening Employee Modal...")
            # Fallback: click the first button in the last td of the first row
            # Use css selector
            page.locator("tbody tr:first-child td:last-child button").first.click()

            time.sleep(2)
            page.screenshot(path="verification_employee_modal.png", full_page=True)
            print("Employee Modal screenshot taken.")

            # Close modal
            page.locator("button:has(svg.lucide-x)").click()
            time.sleep(1)

            # Click Offboarding
            print("Clicking Offboarding tab...")
            page.click("button:has-text('Offboarding')")
            time.sleep(2)
            page.screenshot(path="verification_offboarding.png", full_page=True)
            print("Offboarding screenshot taken.")

        except Exception as e:
            print(f"Error: {e}")
            page.screenshot(path="verification_error.png")
            raise e

        browser.close()

if __name__ == "__main__":
    verify_changes()
