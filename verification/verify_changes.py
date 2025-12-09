from playwright.sync_api import sync_playwright

def verify_changes():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        # Navigate to Dashboard
        try:
            page.goto("http://localhost:3000", timeout=30000)
            page.wait_for_load_state("networkidle")

            # Verify Dashboard Stats (Avg Sick Days)
            # Find "Avg Sick Days" card and take screenshot
            page.screenshot(path="verification/dashboard_full.png", full_page=True)
            print("Dashboard screenshot taken.")

            # Navigate to Vacations
            # "Vacations" button text
            page.get_by_role("button", name="Vacations").click()
            page.wait_for_load_state("networkidle")

            # Check Year Selector
            # It should be present.
            # There is a select element for year.
            # We can select it by the values it has

            # Select 2026
            # The select in Vacations has 2025, 2026, 2027 options
            page.locator("select").first.select_option("2026")
            page.wait_for_timeout(500) # Wait for UI update

            page.screenshot(path="verification/vacations_2026.png", full_page=True)
            print("Vacations 2026 screenshot taken.")

        except Exception as e:
            print(f"Error: {e}")
            page.screenshot(path="verification/error.png")
        finally:
            browser.close()

if __name__ == "__main__":
    verify_changes()
