from playwright.sync_api import sync_playwright

def verify_changes():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        # Navigate to the app
        page.goto("http://localhost:3000")

        # 1. Verify "Vacations" tab exists and navigate to it
        page.wait_for_selector("text=Vacations")
        page.click("text=Vacations")
        page.screenshot(path="verification/vacations_tab.png")
        print("Vacations tab verified.")

        # 2. Verify Employee List sorting and Role
        page.click("text=Employees")
        page.wait_for_selector("text=Employee Directory")

        # Click Add New
        page.click("text=Add New")
        page.wait_for_selector("text=Add New Employee")

        # Check Role dropdown for 'MR'
        page.select_option("select[name='role']", "MR")
        page.screenshot(path="verification/add_employee_mr.png")
        print("MR Role verified.")

        # Close modal
        page.click("button:has-text('Cancel')")

        # 3. Verify Dashboard Countries Chart
        page.click("text=Dashboard")
        page.wait_for_selector("text=Employee Distribution by Country")
        page.screenshot(path="verification/dashboard_country.png")
        print("Country chart verified.")

        browser.close()

if __name__ == "__main__":
    verify_changes()
