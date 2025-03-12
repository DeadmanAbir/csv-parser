#   CSV Parser

##   Overview

This document provides a technical overview of a system designed for processing image data from CSV files. The system handles CSV data input, image processing, and data management.

##   Functionality

The system provides the following core functionalities:

1.  **CSV Data Input:** The system accepts CSV files as input, expecting a defined format for data organization.
    
    * **Example CSV Format:**
        
        |   S. No.   |   Product Name   |   Input Image Urls URLs                     |
        | :----- | :------------ | :------------------------------- |
        |   1    |   Product A   |   url1.jpg, url2.jpg, url3.jpg   |
        |   2    |   Product B   |   url4.jpg, url5.jpg, url6.jpg   |
        
2.  **Data Validation:** Upon receiving a CSV file, the system validates its format to ensure it adheres to the expected structure.
    
3.  **Asynchronous Image Processing:** The system processes images referenced by URLs within the CSV file asynchronously. This processing includes operations such as resizing, compression upto 50%.
    
4.  **Data Storage:** Processed image data and associated information from the CSV file are stored in a database(cloudinary and MongoDB) for persistence and retrieval.
    
5.  **User Interaction:**
    
    * **Request Handling:** When a CSV file is submitted, the system provides a unique request identifier.
    * **Status Inquiries:** An API is available to allow users to query the processing status of their requests using the provided request ID.


##   APIs

The system exposes APIs to facilitate interaction:

1.  **Upload API:**
    
    * Accepts CSV files for processing.
    * Validates the format of the uploaded CSV.
    * Returns a unique identifier for the processing request.
2.  **Status API:**
    
    * Allows users to check the processing status of a specific request.
    * Requires the request identifier as a parameter.

##   Data Output

The system generates processed data, which may include modified image URLs or other relevant information.

* **Example Output Data:**
    
| S. No | Product Name | Input Image Urls                      | Output Image Urls                              |
| :---- | :----------- | :------------------------------------ | :-------------------------------------------- |
| 1     | Product A    | url1.jpg, url2.jpg, url3.jpg         | processed-url1.jpg, processed-url2.jpg, processed-url3.jpg |
| 2     | Product B    | url4.jpg, url5.jpg, url6.jpg         | processed-url4.jpg, processed-url5.jpg, processed-url6.jpg |


##   Technical Design

###   Low-Level Design (LLD)

* A detailed technical design document should be created, including:
    * System architecture diagrams.
    * Component descriptions and their functions.

###   Key Components

* **Image Processing Integration:** The system interacts with an image processing service (sharp.js asynchronous) to perform image manipulation tasks. 

* **Database Interaction:** The system interacts with a database(MongoDB and Cloudinary) to store and manage data related to CSV files, processing requests, and processed data. 

###   Database Schema

* A database schema is designed to effectively store and manage data, including:
    * Data from uploaded CSV files.
    * Status of processing requests.
    * Staus of processing request.
    * Processed data and results.

##   Documentation

* **API Documentation:** Comprehensive API documentation should be provided, detailing: [cite: 21]
    * Endpoints.
    * Request formats.
    * Response formats.

* **Worker Documentation:** If asynchronous workers are used, documentation should describe their functions, processes, and any relevant configurations. 
