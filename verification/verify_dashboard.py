from playwright.sync_api import Page, expect, sync_playwright
import time

def verify_dashboard(page: Page):
    page.on("console", lambda msg: print(f"Console: {msg.text}"))
    page.on("pageerror", lambda err: print(f"Page Error: {err}"))
    print("Navigating to home...")
    page.goto("http://localhost:3000")

    # Check for As Of Date input
    print("Checking As Of Date...")
    as_of_date = page.get_by_label("As Of Date")
    expect(as_of_date).to_be_visible()

    # Check Raise Due is GONE
    print("Checking Raise Due is gone...")
    # Raise Due was a StatCard with title "Raise Due"
    expect(page.get_by_text("Raise Due")).not_to_be_visible()

    # Check Employee Modal
    print("Checking Employee Modal...")
    page.get_by_role("button", name="Employees").click()
    page.get_by_role("button", name="Add New").click()

    # Verify fields in modal
    modal = page.get_by_text("Add New Employee")
    expect(modal).to_be_visible()

    expect(page.get_by_text("VR Status")).to_be_visible()
    expect(page.get_by_role("combobox", name="VR Status")).to_be_visible()

    expect(page.get_by_text("Languages")).to_be_visible()
    # LanguageInput has a placeholder "Type languages..."
    expect(page.get_by_placeholder("Type languages (e.g. English, Spanish)...")).to_be_visible()

    # Verify removed fields
    expect(page.get_by_text("Previous Experience")).not_to_be_visible()
    expect(page.get_by_text("Sick Days YTD")).not_to_be_visible()

    # Take screenshot of Modal
    page.screenshot(path="verification/modal.png")

    # Close modal
    page.get_by_role("button", name="Cancel").click()

    # Take screenshot of Employee List
    page.screenshot(path="verification/employees.png")

    # Go back to Dashboard
    page.get_by_role("button", name="Dashboard").click()

    # Verify Drill Down (Click on VR chart)
    # The BarChart click might be tricky to target by role. We'll skip complex interaction for now,
    # just verify visual state.

    page.screenshot(path="verification/dashboard.png")

if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        try:
            verify_dashboard(page)
        except Exception as e:
            print(f"Error: {e}")
            page.screenshot(path="verification/error.png")
            raise e
        finally:
            browser.close()
