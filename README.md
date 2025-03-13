# CSV Parser


## Video Overview - [Guide tutorial of this project](https://www.loom.com/share/ff8e3783d43345e89bbb4de2024ebb2d?sid=2dd4e2aa-24c7-4060-b091-213679e46bec)

## Overview

This document provides a technical overview of a system designed for processing image data from CSV files. The system handles CSV data input, image processing, and data management.

## Functionality

The system provides the following core functionalities:

1.  **CSV Data Input:** The system accepts CSV files as input, expecting a defined format for data organization.

    - **Example CSV Format:**
      | S. No. | Product Name | Input Image Urls URLs |
      | :----- | :----------- | :--------------------------- |
      | 1 | Product A | url1.jpg, url2.jpg, url3.jpg |
      | 2 | Product B | url4.jpg, url5.jpg, url6.jpg |

2.  **Data Validation:** Upon receiving a CSV file, the system validates its format to ensure it adheres to the expected structure.
3.  **Asynchronous Image Processing:** The system processes images referenced by URLs within the CSV file asynchronously. This processing includes operations such as resizing, compression upto 50%.
4.  **Data Storage:** Processed image data and associated information from the CSV file are stored in a database(cloudinary and MongoDB) for persistence and retrieval.
5.  **User Interaction:**

    - **Request Handling:** When a CSV file is submitted, the system provides a unique request identifier.
    - **Status Inquiries:** An API is available to allow users to query the processing status of their requests using the provided request ID.

## APIs

The system exposes APIs to facilitate interaction:

1.  **Upload API:**

    - Accepts CSV files for processing.
    - Validates the format of the uploaded CSV.
    - Returns a unique identifier for the processing request.

2.  **Status API:**

    - Allows users to check the processing status of a specific request.
    - Requires the request identifier as a parameter.

## Data Output

The system generates processed data, which may include modified image URLs or other relevant information.

- **Example Output Data:**

| S. No | Product Name | Input Image Urls             | Output Image Urls                                          |
| :---- | :----------- | :--------------------------- | :--------------------------------------------------------- |
| 1     | Product A    | url1.jpg, url2.jpg, url3.jpg | processed-url1.jpg, processed-url2.jpg, processed-url3.jpg |
| 2     | Product B    | url4.jpg, url5.jpg, url6.jpg | processed-url4.jpg, processed-url5.jpg, processed-url6.jpg |

## Technical Design

### Low-Level Design (LLD)

- A detailed technical design document should be created, including:
  - System architecture diagrams.
  - Component descriptions and their functions.

### Key Components

- **Image Processing Integration:** The system interacts with an image processing service (sharp.js asynchronous) to perform image manipulation tasks.

- **Database Interaction:** The system interacts with a database(MongoDB and Cloudinary) to store and manage data related to CSV files, processing requests, and processed data.

### Database Schema

- A database schema is designed to effectively store and manage data, including:
  - Data from uploaded CSV files.
  - Status of processing requests.
  - Staus of processing request.
  - Processed data and results.


### Postman Collection 

Here's a postman collection containing all curated api links - [Postman Collection](https://www.postman.com/payload-cosmologist-18352458/workspace/my-workspace/collection/28067356-5aa63ab5-5f24-4b48-89e9-711bd55b2e9b?action=share&creator=28067356)

### API Documentation

This section details the API endpoints for interacting with the CSV Image Processing System.

1. **Upload API:**

- **Endpoint:** `https://csv-parser-theta.vercel.app/api/process-csv`
- **Method:** `POST`
- **Description:** This endpoint accepts CSV files as input. It processes the CSV data, stores it in the database, and initiates the processing workflow. The API returns a unique status ID for the process, along with the JSON formatted data derived from the CSV file.
- **Request Body:**
  - The request body should contain the CSV file data encoded as `multipart/form-data`. You'll typically have a field in the form data (e.g., named "csvfile") containing the CSV file.
  - - Example:\*

      - To send the CSV file, you would use a `multipart/form-data` request. The form data would include a field, for example, "csvfile", with the actual CSV file as the value.
- **Response:**
  - A successful response will include:
    - A unique status ID, which can be used to track the processing status.
    - The JSON formatted data derived from the CSV file.
  - - Example Response:\*

      ```json
      {
        "statusId": "your-unique-status-id",
        "csvData": [
          {
            "S. No.": "1",
            "Product Name": "SKU1",
            "Input Image Urls": "url1.jpg,url2.jpg,url3.jpg"
          },
          {
            "S. No.": "2",
            "Product Name": "SKU2",
            "Input Image Urls": "url4.jpg,url5.jpg,url6.jpg"
          }
        ]
      }
      ```

2.  **Image Processing Initiation API:**

    - **Endpoint:** `https://csv-parser-theta.vercel.app/api/minify-images`
    - **Method:** `POST`
    - **Description:** This endpoint takes a request ID as input and initiates the asynchronous image compression process. It returns a request ID specifically for the image minification process.
    - **Request Body:**

      - The request body should include the `request ID` of the previously uploaded CSV data for which image processing is to be started.

      - Example Request Body:
        ```json
        {
          "id": "your-csv-upload-request-id"
        }
        ```

    - **Response:**
      - A successful response will include a unique request ID for the image minification process, which can be used to track the image processing status.

3.  **Processing Status API:**

    - **Endpoint:** `https://csv-parser-theta.vercel.app/api/get-status/{requestId}`
    - **Method:** `GET`
    - **Description:** This is a dynamic API endpoint. It allows users to retrieve the processing status of an asynchronous operation. The `{requestId}` in the URL is a placeholder for the specific request ID you want to query.
    - **Parameters:**
      - `requestId` (in the URL path): The unique identifier of the processing request.
    - **Response:**
      - The response will contain the status of the asynchronous process. This might include states like "Pending," "Processing," "Completed," or "Error," along with any relevant details or messages.
