# School Administrator User Manual

Welcome to the Admin Management Console user guide. This document explains how administrators, exam incharges, and teachers can manage student and faculty records, upload examination results, update institutional settings, and generate DMCs.

---

## 1. Accessing the Admin Console

1. Open the website homepage and click **Admin Portal** in the top header (or navigate directly to your secure login path).
2. Enter your authorized administrator email and password.
3. Click **Sign In to Dashboard**.

---

## 2. Uploading Examination Results via Excel/CSV

The portal allows exam incharges to upload student results in batch using standard spreadsheets parsed via client-side libraries.

### Step-by-Step Instructions:
1. Prepare a spreadsheet containing required columns: `RollNo`, `Name`, `Class`, etc. (or specific subject-wise mark columns).
2. Log into the Admin Dashboard and select **Upload Results** from the left navigation menu.
3. Click **Choose File** and select your `.xlsx` or `.csv` result file.
4. Click **Parse & Validate File**.
5. The system will inspect your file for validation errors:
   * If any row has missing roll numbers or invalid marks, a warning box will display the row number and specific error reason.
6. Review the live preview table containing parsed student names, roll numbers, and marks.
7. Click **Confirm & Batch Upsert** to publish the results directly to the secure cloud database.

---

## 3. Student Record Management

1. From the Admin Dashboard sidebar, click **Student Management**.
2. To add a new student, click **Add New Student** and fill in the required fields including Roll Number, Student Name, Class, and Session track.
3. To update or remove a record, click the action icons next to the targeted student entry in the directory table.

---

## 4. Faculty Management

1. From the Admin Dashboard sidebar, click **Faculty Management**.
2. To add a new faculty member, click **Add Faculty** and provide their name, designation, qualification, subject specialization, and experience years.
3. To edit or remove existing staff entries, use the action controls next to the faculty listing.

---

## 5. Institutional Settings

1. Access the **Settings** panel from the administrator console.
2. Update general school metadata, contact details, principal information, and system parameters as needed.
3. Save changes to instantly update the information across the public-facing portal.

---

## 6. Searching Results & Printing DMCs (Public Portal)

1. Navigate to **Check Result** from the main website navigation.
2. Select the student's **Class** and enter their **Roll Number** or **Student ID**.
3. Click **Generate & View DMC**.
4. The system will generate an official **Detailed Marks Certificate (DMC)** complete with institution branding, marks table, calculated percentage, overall grade, and remarks.
5. To print or download:
   * Click **Download PDF** to save an official `.pdf` file to your computer.
   * Click **Print Certificate** to send the layout directly to a connected printer.