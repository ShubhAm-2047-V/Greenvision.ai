import fitz # PyMuPDF
import sys

try:
    doc = fitz.open("Mini Project Report 2024-25.pdf")
    for page_index in range(len(doc)):
        page = doc[page_index]
        image_list = page.get_images(full=True)
        for image_index, img in enumerate(image_list, start=1):
            xref = img[0]
            base_image = doc.extract_image(xref)
            image_bytes = base_image["image"]
            image_ext = base_image["ext"]
            image_filename = f"logo.{image_ext}"
            with open(image_filename, "wb") as f:
                f.write(image_bytes)
            print(f"Extracted: {image_filename}")
            sys.exit(0) # Exit after first image (logo)
except Exception as e:
    print(f"Error: {e}")
